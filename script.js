 // ========== GLOBAL STATE ==========
  let parcelQueue = [
    { id: 'DEL-7302', name: 'Raj Electronics', dest: 'BLR' },
    { id: 'BOM-4156', name: 'Shree Textiles', dest: 'MAA' },
    { id: 'CCU-9881', name: 'Bengal Spices', dest: 'HYD' }
  ];

  let shipmentHistory = [
    { awb: 'DEL-2105', sender: 'Vijay Sales', dest: 'BOM', status: 'delivered', route: 'DEL→BOM' },
    { awb: 'HYD-7710', sender: 'Pearl Pharma', dest: 'CCU', status: 'in transit', route: 'HYD→BOM→CCU' },
  ];

  const graph = { DEL:{BOM:1400,CCU:1470}, BOM:{DEL:1400,CCU:1950,BLR:980,HYD:710}, CCU:{DEL:1470,BOM:1950,BLR:1860,MAA:1680}, BLR:{BOM:980,CCU:1860,MAA:350,HYD:570}, HYD:{BOM:710,BLR:570,MAA:620}, MAA:{BLR:350,HYD:620,CCU:1680} };

  // navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const pageId = item.getAttribute('data-page');
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
      document.getElementById(pageId + '-page').classList.add('active-page');
    });
  });

  // helpers
  function escapeHtml(str) { return String(str||'').replace(/[&<>"]/g,c=>c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':c==='"'?'&quot;':c); }

  function refreshDashboard() {
    const qc = document.getElementById('queueContainer');
    if (!qc) return;
    if (parcelQueue.length===0) qc.innerHTML = '<div class="queue-item" style="justify-content:center;">🚚 No parcels</div>';
    else {
      let html=''; parcelQueue.forEach((p,i)=>{ html+=`<div class="queue-item"><span class="queue-pos">${i+1}</span><span><i class="fas fa-tag"></i> ${escapeHtml(p.id)}</span><span>${escapeHtml(p.name)}</span><span class="queue-dest">${escapeHtml(p.dest)}</span></div>`; });
      qc.innerHTML = html;
    }
    document.getElementById('queueCountBadge') && (document.getElementById('queueCountBadge').innerText = parcelQueue.length+' items');
    document.getElementById('statPending') && (document.getElementById('statPending').innerText = parcelQueue.length);
    document.getElementById('statInTransit') && (document.getElementById('statInTransit').innerText = 3 + Math.floor(Math.random()*5));
    document.getElementById('statDelivered') && (document.getElementById('statDelivered').innerText = 187 + Math.floor(Math.random()*10));
    let tb = document.getElementById('tableBody');
    if (tb) {
      let all = [...shipmentHistory, ...parcelQueue.slice(0,2).map(p=>({awb:p.id,sender:p.name,dest:p.dest,status:'pending',route:'→'+p.dest}))];
      tb.innerHTML = all.slice(0,5).map(s=>`<tr><td><b>${escapeHtml(s.awb)}</b></td><td>${escapeHtml(s.sender)}</td><td>${escapeHtml(s.dest)}</td><td><span class="status-badge ${s.status==='delivered'?'':'orange'}">${escapeHtml(s.status)}</span></td><td>${escapeHtml(s.route||'—')}</td></tr>`).join('');
    }
  }

  window.addParcel = function() {
    const id = document.getElementById('parcelId')?.value.trim();
    const name = document.getElementById('senderName')?.value.trim();
    let dest = document.getElementById('destination')?.value.trim().toUpperCase();
    if (!id||!name||!dest) return alert('Fill all');
    if (!['DEL','BOM','CCU','BLR','MAA','HYD'].includes(dest)) return alert('Invalid city');
    parcelQueue.push({id,name,dest});
    refreshDashboard();
    ['parcelId','senderName','destination'].forEach(id=>document.getElementById(id).value='');
  };

  window.dispatchParcel = function() {
    if (!parcelQueue.length) return alert('Queue empty');
    let rem = parcelQueue.shift();
    shipmentHistory.unshift({awb:rem.id,sender:rem.name,dest:rem.dest,status:'in transit',route:'→'+rem.dest});
    refreshDashboard();
    alert(`Dispatched ${rem.id}`);
  };

  window.generateMockShipment = function() {
    let c = ['DEL','BOM','CCU','BLR','MAA','HYD']; let n = ['Patel','Kumar','Singh'];
    parcelQueue.push({ id:'MOCK-'+Math.floor(100+Math.random()*900), name: n[Math.floor(Math.random()*3)]+' Exports', dest: c[Math.floor(Math.random()*6)] });
    refreshDashboard();
  };

  function dijkstra(start,end) {
    let dist={}, vis={}, prev={}, nodes=Object.keys(graph);
    for(let n of nodes) {dist[n]=Infinity; vis[n]=false; prev[n]=null;}
    dist[start]=0;
    while(true) {
      let closest=null;
      for(let n of nodes) if(!vis[n] && (closest===null || dist[n]<dist[closest])) closest=n;
      if(closest===null || dist[closest]===Infinity) break;
      vis[closest]=true;
      for(let nb in graph[closest]) {
        let nd = dist[closest] + graph[closest][nb];
        if(nd < dist[nb]) { dist[nb]=nd; prev[nb]=closest; }
      }
    }
    let path=[], node=end;
    if(prev[end]===null && end!==start) return {path:[],distance:Infinity};
    while(node) { path.unshift(node); node=prev[node]; }
    return {path,distance:dist[end]};
  }

  window.showShortestPath = function() {
    let t = document.getElementById('cityTarget')?.value.trim().toUpperCase();
    if (!t || !graph[t]) { document.getElementById('pathText').innerText='Invalid'; document.getElementById('distText').innerText='—'; return; }
    let r = dijkstra('DEL',t);
    document.getElementById('pathText').innerText = r.path.join(' → ') || 'none';
    document.getElementById('distText').innerText = r.distance + ' km';
  };

  window.planRoute = function() {
    let f = document.getElementById('rpFrom')?.value.trim().toUpperCase() || 'DEL';
    let t = document.getElementById('rpTo')?.value.trim().toUpperCase() || 'MAA';
    if(!graph[f]||!graph[t]) { document.getElementById('rpPath').innerText='invalid city'; return; }
    let r = dijkstra(f,t);
    document.getElementById('rpPath').innerText = r.path.join(' → ') || 'no path';
    document.getElementById('rpDist').innerText = (r.distance ? r.distance+' km' : '');
  };

  // periodic refresh
  setInterval(refreshDashboard, 7000);
  refreshDashboard();
  // set default route
  window.onload = function() { if(document.getElementById('pathText')) showShortestPath(); };
