import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TheoryCard from '../components/TheoryCard';
import AnimatedBackground from '../components/AnimatedBackground';
import MathText from '../lesson/MathText';
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
        <p><MathText text='Coding theory is fundamentally geometric, even though it is taught algebraically. A "Hamming Space" maps codewords as physical points in an $n$-dimensional hypercube.' /></p>
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
        <p><MathText text="A Linear Block Code maps a fixed-length $k$-bit message to an $n$-bit codeword by appending $n-k$ redundant parity bits. This extra padding is what allows the receiver to detect and fix errors." /></p>
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
        <p>Codes are typically defined by their parameters <strong>(n, k)</strong>:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
          <li><strong>n</strong> = Total number of bits in the transmitted block.</li>
          <li><strong>k</strong> = Number of actual data/message bits.</li>
          <li><strong>n-k (or r)</strong> = Number of parity bits.</li>
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
        <p>The formula is: <code><MathText text="2^r \\ge k + r + 1" /></code></p>
        <p><MathText text="For $k=4$, $r=2$ gives $4 \\ge 7$ (False). But $r=3$ gives $8 \\ge 8$ (True). So we need 3 parity bits." /></p>
      </>
    ),
    Diagram: ParityFormulaDiagram
  },
  {
    id: 'g-matrix',
    title: '5. Constructing the G Matrix',
    content: (
      <>
        <p><MathText text="The Generator Matrix ($G$) is the blueprint for creating codewords. For a systematic code (where the original message appears exactly at the start of the codeword), $G$ is constructed by joining an Identity Matrix ($I$) with a Parity Matrix ($P$)." /></p>
        <p><MathText text="$G = [ I_k | P ]$" /></p>
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
        <p><MathText text="To encode our message $m$, we multiply it by the Generator matrix $G$. All math is done in Galois Field 2 (GF(2)), meaning addition is done via XOR and there are no carries." /></p>
        <p>Equation: <code><MathText text="c = m \\times G" /></code></p>
        <p><MathText text="If $m = [1 0 1 1]$, the resulting codeword $c$ will have the message in the first 4 bits, and the calculated parity in the last 3 bits." /></p>
      </>
    ),
    Diagram: MatrixMultiplyDiagram
  },
  {
    id: 'transmission',
    title: '7. Transmission',
    content: (
      <>
        <p><MathText text="Once formed, the codeword $c$ is transmitted over a communication channel (like a fiber optic cable, deep space radio wave, or writing to a hard drive)." /></p>
      </>
    )
  },
  {
    id: 'channel-noise',
    title: '8. Channel Noise',
    content: (
      <>
        <p><MathText text='The physical world is noisy. Cosmic rays, thermal noise, or scratches can flip bits. In coding theory, we model this by adding an "error vector" $e$ to our codeword.' /></p>
        <p><MathText text="If the third bit flips, $e = [0 0 1 0 0 0 0]$." /></p>
      </>
    ),
    Diagram: ChannelNoiseDiagram
  },
  {
    id: 'received',
    title: '9. The Received Vector',
    content: (
      <>
        <p><MathText text="The receiver doesn't know $c$ or $e$; they only get the received vector $r$." /></p>
        <p>Equation: <code><MathText text="r = c \\oplus e" /></code> (modulo-2 arithmetic).</p>
        <p><MathText text="The receiver's job is to figure out if $r$ is a valid codeword, and if not, which bit was flipped by $e$." /></p>
      </>
    )
  },
  {
    id: 'h-matrix',
    title: '10. The Parity-Check Matrix (H) & Syndrome',
    content: (
      <>
        <p><MathText text="The receiver multiplies $r$ by the transpose of the Parity-Check Matrix ($H$) to get the " /><strong>Syndrome (<MathText text="$S$" />)</strong>. <MathText text="Think of $S$ as an error fingerprint." /></p>
        <p><code><MathText text="S = r \\times H^T" /></code></p>
        <p><MathText text="If $S = [0 0 0]$, there are no detected errors. If $S \\neq [0 0 0]$, the syndrome precisely matches one of the columns in $H$, telling the receiver exactly which bit index is corrupted." /></p>
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
        <p><MathText text="Because the code is systematic, the receiver can simply slice off the parity bits to perfectly recover the original $k$-bit message." /></p>
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
      const scrollPosition = window.scrollY + 200; // Offset for header

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
        top: el.offsetTop - 100, // Offset for sticky header
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Header />
      
      <main className="container mx-auto flex flex-col md:flex-row px-4 md:px-8 py-8 relative">
        <Sidebar 
          topics={theoryData} 
          activeTopic={activeTopic} 
          onTopicClick={scrollToTopic} 
        />
        
        <div className="flex-1 md:pl-10 lg:pl-16 w-full max-w-4xl pt-4">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Theory <span className="text-blue-500">&</span> Architecture
            </h1>
            <p className="text-lg text-slate-400">
              Understanding the math and geometry behind the (7,4) Hamming code simulation.
            </p>
          </div>

          <div className="space-y-10">
            {theoryData.map((topic) => (
              <TheoryCard 
                key={topic.id}
                id={topic.id}
                title={topic.title}
                content={topic.content}
                Diagram={topic.Diagram}
                codeBlock={topic.codeBlock}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
