import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TheoryCard from '../components/TheoryCard';
import AnimatedBackground from '../components/AnimatedBackground';
import InfiniteSpiral from '../components/InfiniteSpiral';
import BlurText from '../components/BlurText';
import GradientText from '../components/reactbits/GradientText';
import { spiralTopics } from '../components/SpiralThumbnails';
import { M } from '../components/Math';
import { 
  HammingSpaceDiagram, 
  BlockCodeDiagram, 
  ParityFormulaDiagram, 
  MatrixMultiplyDiagram, 
  ChannelNoiseDiagram, 
  SyndromeDiagram 
} from '../components/Diagrams';

const theoryData = [
  {
    id: 'hamming-space',
    title: '1. Hamming Space',
    content: (
      <>
        <p>Coding theory is fundamentally geometric, even though it's taught algebraically. A "Hamming Space" maps codewords as physical points in an <M>n</M>-dimensional hypercube.</p>
        <p>In this space, valid messages (codewords) are placed far enough apart so that if a few bits flip (causing the point to drift), it's still physically closer to the original codeword than to any other valid one.</p>
      </>
    ),
    Diagram: HammingSpaceDiagram
  },
  {
    id: 'linear-block',
    title: '2. Linear Block Codes & Parity',
    content: (
      <>
        <p>A Linear Block Code maps a fixed-length <M>k</M>-bit message to an <M>n</M>-bit codeword by appending <M>{'n - k'}</M> redundant parity bits. This extra padding is what allows the receiver to detect and fix errors.</p>
        <p>The term "linear" means that adding any two valid codewords together (via XOR) produces another valid codeword.</p>
      </>
    ),
    Diagram: BlockCodeDiagram
  },
  {
    id: 'parameters',
    title: '3. Parameters: The (n, k) Code',
    content: (
      <>
        <p>Codes are typically defined by their parameters <M>(n, k)</M>:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
          <li><M>n</M> = Total number of bits in the transmitted block.</li>
          <li><M>k</M> = Number of actual data/message bits.</li>
          <li><M>{'n - k'}</M> (or <M>r</M>) = Number of parity bits.</li>
        </ul>
        <p className="mt-2">A famous example is the <strong>(7, 4) Hamming Code</strong>, which sends 4 bits of data using 7 total bits (3 parity bits). It can correct exactly 1 bit error.</p>
      </>
    )
  },
  {
    id: 'generator-matrix-size',
    title: '4. Parity Bit Formula',
    content: (
      <>
        <p>How do we know we need exactly 3 parity bits for 4 data bits? We use the Hamming bound formula to ensure we have enough unique combinations to identify every possible single-bit error.</p>
        <p>The formula is:</p>
        <M display>{'2^r \\geq m + r + 1'}</M>
        <p>For <M>{'k = 4'}</M>, <M>{'r = 2'}</M> gives <M>{'4 \\geq 7'}</M> (False). But <M>{'r = 3'}</M> gives <M>{'8 \\geq 8'}</M> (True). So we need 3 parity bits.</p>
      </>
    ),
    Diagram: ParityFormulaDiagram
  },
  {
    id: 'g-matrix',
    title: '5. Constructing the G Matrix',
    content: (
      <>
        <p>The Generator Matrix (<M>G</M>) is the blueprint for creating codewords. For a systematic code (where the original message appears exactly at the start of the codeword), <M>G</M> is constructed by joining an Identity Matrix (<M>{'I_k'}</M>) with a Parity Matrix (<M>P</M>).</p>
        <M display>{'G = [ I_k \\mid P ]'}</M>
      </>
    ),
    codeBlock: `G = [
  1  0  0  0  |  1  1  0
  0  1  0  0  |  0  1  1
  0  0  1  0  |  1  1  1
  0  0  0  1  |  1  0  1
]`
  },
  {
    id: 'codeword-formation',
    title: '6. Codeword Formation',
    content: (
      <>
        <p>To encode our message <M>m</M>, we multiply it by the Generator matrix <M>G</M>. All math is done in Galois Field 2 (GF(2)), meaning addition is done via XOR and there are no carries.</p>
        <M display>{'c = m \\times G'}</M>
        <p>If <M>{'m = [1\\ 0\\ 1\\ 1]'}</M>, the resulting codeword <M>c</M> will have the message in the first 4 bits, and the calculated parity in the last 3 bits.</p>
      </>
    ),
    Diagram: MatrixMultiplyDiagram
  },
  {
    id: 'transmission',
    title: '7. Transmission',
    content: (
      <>
        <p>Once formed, the codeword <M>c</M> is transmitted over a communication channel (like a fiber optic cable, deep space radio wave, or writing to a hard drive).</p>
      </>
    )
  },
  {
    id: 'channel-noise',
    title: '8. Channel Noise',
    content: (
      <>
        <p>The physical world is noisy. Cosmic rays, thermal noise, or scratches can flip bits. In coding theory, we model this by adding an "error vector" <M>e</M> to our codeword.</p>
        <p>If the third bit flips, <M>{'e = [0\\ 0\\ 1\\ 0\\ 0\\ 0\\ 0]'}</M>.</p>
      </>
    ),
    Diagram: ChannelNoiseDiagram
  },
  {
    id: 'received',
    title: '9. The Received Vector',
    content: (
      <>
        <p>The receiver doesn't know <M>c</M> or <M>e</M>; they only get the received vector <M>r</M>.</p>
        <M display>{'r = c + e \\quad \\text{(modulo-2 arithmetic)}'}</M>
        <p>The receiver's job is to figure out if <M>r</M> is a valid codeword, and if not, which bit was flipped by <M>e</M>.</p>
      </>
    )
  },
  {
    id: 'h-matrix',
    title: '10. The Parity-Check Matrix (H) & Syndrome',
    content: (
      <>
        <p>The receiver multiplies <M>r</M> by the transpose of the Parity-Check Matrix (<M>H</M>) to get the <strong>Syndrome</strong> (<M>S</M>). Think of <M>S</M> as an error fingerprint.</p>
        <M display>{'S = r \\times H^T'}</M>
        <p>If <M>{'S = [0\\ 0\\ 0]'}</M>, there are no detected errors. If <M>{'S \\neq [0\\ 0\\ 0]'}</M>, the syndrome precisely matches one of the columns in <M>H</M>, telling the receiver exactly which bit index is corrupted.</p>
      </>
    ),
    Diagram: SyndromeDiagram
  },
  {
    id: 'decode',
    title: '11. Final Decoding',
    content: (
      <>
        <p>Once the syndrome identifies the error column, the receiver flips that specific bit back to its correct state.</p>
        <p>Because the code is systematic, the receiver can simply slice off the parity bits to perfectly recover the original <M>k</M>-bit message.</p>
      </>
    )
  }
];

export default function Home() {
  const [activeTopic, setActiveTopic] = useState(theoryData[0].id);

  // Scrollspy logic
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = theoryData.map(t => document.getElementById(t.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTopic(theoryData[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTopic = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      <AnimatedBackground />
      <Header />
      <Sidebar 
        topics={theoryData} 
        activeTopic={activeTopic} 
        onTopicClick={scrollToTopic} 
      />
      
      <main className="mx-auto max-w-5xl px-6 md:px-12 py-12 relative z-10">
        {/* ===== HERO SECTION WITH SPIRAL ===== */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 relative"
        >
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left: Title + tagline */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="mb-4 flex justify-center lg:justify-start">
                <GradientText
                  colors={['#38bdf8', '#818cf8', '#22d3ee', '#60a5fa']}
                  animationSpeed={6}
                  showBorder={true}
                  className="px-3.5 py-1 text-xs font-semibold tracking-wider uppercase"
                >
                  HammingSpace
                </GradientText>
              </div>

              <div className="mb-5 flex justify-center lg:justify-start">
                <GradientText
                  colors={['#ffffff', '#38bdf8', '#818cf8', '#22d3ee', '#ffffff']}
                  animationSpeed={8}
                  showBorder={false}
                  className="m-0 lg:mx-0 inline-flex"
                >
                  <BlurText
                    text="Theory & Architecture"
                    delay={180}
                    animateBy="words"
                    direction="top"
                    as="h1"
                    className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight justify-center lg:justify-start"
                  />
                </GradientText>
              </div>
              <BlurText
                text="Understanding the math and geometry behind the (7,4) Hamming code simulation."
                delay={50}
                startDelay={550}
                animateBy="words"
                direction="top"
                className="text-lg text-slate-400 max-w-md mx-auto lg:mx-0 mb-6 justify-center lg:justify-start"
                as="p"
              />
              <p className="text-sm text-slate-500">
                Click a topic in the spiral to jump to its section →
              </p>
            </motion.div>

            {/* Right: Spiral carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full max-w-md lg:max-w-lg"
              style={{ height: '340px', position: 'relative' }}
            >
              <InfiniteSpiral
                items={spiralTopics}
                animationMode="auto"
                speed={0.35}
                radius={140}
                cardWidth={80}
                cardHeight={80}
                verticalSpacing={50}
                perspective={900}
                cardRadius={8}
                centerScale={1.3}
                edgeBlur={4}
                cardsPerTurn={7}
                pauseOnHover
                direction="up"
                rotation={0}
                cardTilt={0}
                edgeFade={0.25}
                grayscale={0}
                onItemClick={(item) => scrollToTopic(item.id)}
                renderItem={(item) => <item.Thumb />}
              />
            </motion.div>
          </div>
        </motion.section>

        <div className="flex flex-col gap-10">
          {theoryData.map((topic, i) => (
            <TheoryCard 
              key={topic.id} 
              id={topic.id}
              title={topic.title}
              content={topic.content}
              Diagram={topic.Diagram}
              codeBlock={topic.codeBlock}
              paper={topic.paper}
              index={i}
              isActive={activeTopic === topic.id}
              onSelect={(id) => {
                setActiveTopic(id);
                scrollToTopic(id);
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

