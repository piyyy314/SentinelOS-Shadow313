// OpenQASM 2.0 Shor's Algorithm 15 order finding circuit representation
OPENQASM 2.0;
include "qelib1.inc";

qreg q[4];
creg c[4];

h q[0];
h q[1];
h q[2];
h q[3];

// Controlled multiplier module (a=7, N=15)
// Representing mod 15 multiplications as gates
x q[3];
cx q[0], q[1];
cx q[1], q[2];
cx q[2], q[3];

// Inverse Quantum Fourier Transform
h q[0];
cu1(pi/2) q[1], q[0];
h q[1];
cu1(pi/4) q[2], q[0];
cu1(pi/2) q[2], q[1];
h q[2];
cu1(pi/8) q[3], q[0];
cu1(pi/4) q[3], q[1];
cu1(pi/2) q[3], q[2];
h q[3];

measure q -> c;
