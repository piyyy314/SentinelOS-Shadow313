// OpenQASM 2.0 Grover's Search circuit representation (4-item database, target 11)
OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

// Superposition initialization
h q[0];
h q[1];

// Oracle for target state |11>
cz q[0], q[1];

// Diffusion Operator
h q[0];
h q[1];
x q[0];
x q[1];
cz q[0], q[1];
x q[0];
x q[1];
h q[0];
h q[1];

measure q -> c;
