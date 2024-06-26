document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('next-level').addEventListener('click', nextLevel);

let nodes = [];
let edges = [];
let currentLevel = 0;

const levels = [
    {
        nodes: [
            { id: 1, x: 100, y: 100 },
            { id: 2, x: 300, y: 100 },
            { id: 3, x: 500, y: 100 },
            { id: 4, x: 700, y: 100 }
        ],
        edges: [],
        instruction: 'یک مسیر بین گره‌ها ایجاد کنید'
    },
    {
        nodes: [
            { id: 1, x: 200, y: 200 },
            { id: 2, x: 400, y: 200 },
            { id: 3, x: 300, y: 400 },
            { id: 4, x: 500, y: 400 }
        ],
        edges: [],
        instruction: 'یک گراف همبند ایجاد کنید'
    },
    {
        nodes: [
            { id: 1, x: 100, y: 100 },
            { id: 2, x: 700, y: 100 },
            { id: 3, x: 100, y: 500 },
            { id: 4, x: 700, y: 500 }
        ],
        edges: [],
        instruction: 'یک درخت ایجاد کنید'
    },
    {
        nodes: [
            { id: 1, x: 200, y: 200 },
            { id: 2, x: 600, y: 200 },
            { id: 3, x: 200, y: 400 },
            { id: 4, x: 600, y: 400 }
        ],
        edges: [],
        instruction: 'یک گراف دو بخشی ایجاد کنید'
    }
];

const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

function startGame() {
    document.getElementById('start-game').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');
    loadLevel(currentLevel);
    canvas.addEventListener('click', onCanvasClick);
}

function loadLevel(level) {
    nodes = levels[level].nodes;
    edges = levels[level].edges;
    document.getElementById('instruction').textContent = levels[level].instruction;
    drawNodes();
}

function drawNodes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = selectedNode && selectedNode.id === node.id ? 'rgba(255, 64, 129, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText(node.id, node.x - 5, node.y + 5);
    });
    drawEdges();
}

function drawEdges() {
    edges.forEach(edge => {
        const nodeA = nodes.find(node => node.id === edge[0]);
        const nodeB = nodes.find(node => node.id === edge[1]);
        if (nodeA && nodeB) {
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = '#ff4081';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });
}

let selectedNode = null;
function onCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const clickedNode = nodes.find(node => Math.hypot(node.x - x, node.y - y) < 20);
    if (clickedNode) {
        if (selectedNode) {
            edges.push([selectedNode.id, clickedNode.id]);
            selectedNode = null;
        } else {
            selectedNode = clickedNode;
        }
    }
    drawNodes();
    if (checkGraph()) {
        document.getElementById('next-level').classList.remove('hidden');
    }
}

function checkGraph() {
    const isConnected = (nodes, edges) => {
        let visited = new Set();
        let queue = [nodes[0]];
        while (queue.length > 0) {
            const currentNode = queue.shift();
            visited.add(currentNode);
            const adjacentNodes = edges
                .filter(edge => edge[0] === currentNode.id || edge[1] === currentNode.id)
                .map(edge => edge[0] === currentNode.id ? edge[1] : edge[0])
                .map(id => nodes.find(node => node.id === id));
            adjacentNodes.forEach(node => {
                if (!visited.has(node)) {
                    queue.push(node);
                }
            });
        }
        return nodes.every(node => visited.has(node));
    };

    const isTree = (nodes, edges) => isConnected(nodes, edges) && edges.length === nodes.length - 1;

    const isBipartite = (nodes, edges) => {
        let color = new Map();
        let queue = [nodes[0]];
        color.set(nodes[0], 0);
        while (queue.length > 0) {
            const currentNode = queue.shift();
            const currentColor = color.get(currentNode);
            const adjacentNodes = edges
                .filter(edge => edge[0] === currentNode.id || edge[1] === currentNode.id)
                .map(edge => edge[0] === currentNode.id ? edge[1] : edge[0])
                .map(id => nodes.find(node => node.id === id));
            for (const node of adjacentNodes) {
                if (!color.has(node)) {
                    color.set(node, 1 - currentColor);
                    queue.push(node);
                } else if (color.get(node) === currentColor) {
                    return false;
                }
            }
        }
        return true;
    };

    if (currentLevel === 0) {
        return isConnected(nodes, edges);
    } else if (currentLevel === 1) {
        return isConnected(nodes, edges);
    } else if (currentLevel === 2) {
        return isTree(nodes, edges);
    } else if (currentLevel === 3) {
        return isBipartite(nodes, edges);
    }
    return false;
}

function nextLevel() {
    currentLevel++;
    if (currentLevel < levels.length) {
        loadLevel(currentLevel);
        document.getElementById('next-level').classList.add('hidden');
    } else {
        alert('تبریک! شما تمام مراحل را گذراندید.');
        document.getElementById('next-level').classList.add('hidden');
    }
}