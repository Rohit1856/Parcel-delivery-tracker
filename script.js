let parcelQueue = [];

function addParcel() {
  const id = document.getElementById("parcelId").value;
  const name = document.getElementById("senderName").value;
  const dest = document.getElementById("destination").value.toUpperCase();

  if (!id || !name || !dest) return alert("Please fill all fields");

  parcelQueue.push({ id, name, dest });
  updateQueueDisplay();

  document.getElementById("parcelId").value = "";
  document.getElementById("senderName").value = "";
  document.getElementById("destination").value = "";
}

function dispatchParcel() {
  if (parcelQueue.length === 0) {
    alert("No parcels to dispatch");
    return;
  }
  const removed = parcelQueue.shift();
  alert(`Dispatched: ${removed.id} to ${removed.dest}`);
  updateQueueDisplay();
}

function updateQueueDisplay() {
  const list = document.getElementById("queueList");
  list.innerHTML = "";

  parcelQueue.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerText = `#${i + 1} - ${p.id} - ${p.name} to ${p.dest}`;
    list.appendChild(li);
  });
}

// Graph: Cities and distances
const graph = {
  A: { B: 4, C: 2 },
  B: { A: 4, D: 5 },
  C: { A: 2, D: 8, E: 10 },
  D: { B: 5, C: 8, E: 2, Z: 6 },
  E: { C: 10, D: 2, Z: 3 },
  Z: {}
};

function dijkstra(start, end) {
  const distances = {};
  const visited = {};
  const prev = {};

  for (let node in graph) {
    distances[node] = Infinity;
    visited[node] = false;
  }
  distances[start] = 0;

  while (true) {
    let closest = null;
    for (let node in graph) {
      if (!visited[node] && (closest === null || distances[node] < distances[closest])) {
        closest = node;
      }
    }

    if (closest === null) break;
    visited[closest] = true;

    for (let neighbor in graph[closest]) {
      let newDist = distances[closest] + graph[closest][neighbor];
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        prev[neighbor] = closest;
      }
    }
  }

  // Reconstruct path
  let path = [];
  let node = end;
  while (node) {
    path.unshift(node);
    node = prev[node];
  }

  return { path, distance: distances[end] };
}

function showShortestPath() {
  const target = document.getElementById("cityTarget").value.toUpperCase();
  if (!graph[target]) {
    document.getElementById("shortestPathResult").innerText = "Invalid city!";
    return;
  }

  const result = dijkstra("A", target);
  document.getElementById("shortestPathResult").innerText =
    `Path: ${result.path.join(" ➝ ")} | Distance: ${result.distance}`;
}
