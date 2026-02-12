// import Prism from 'prismjs';
// import 'prismjs/components/prism-qasm';
import { useEffect, useRef } from 'react';

type Props = {
  code: string;
};

export default function CodeEditor({ code }: Props) {
  const codeBlock = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!codeBlock.current) return;
    // Prism.highlightElement(codeBlock.current);
  }, [code]);

  return (
    <div>
      <pre>
        <code ref={codeBlock} className="language-qasm">
          {`
            OPENQASM 3;
            include "stdgates.inc";
            
            qubit[2] q;
            bit[2] c;
            
            h q[0];
            cx q[0], q[1];
          `}
        </code>
      </pre>
    </div>
  );
}
