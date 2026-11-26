/* Pure transition rules; no storage, UI, network or timers. */
(function (env) {
  'use strict';
  const create = () => ({
    page:'brief', opened:[], traced:[], viewed:null, pair:[], relation:null, compared:false,
    claims:{}, decision:null, repair:null, transfer:{}, checked:false
  });
  const phases=['brief','evidence','decide','review','debrief'];
  const get = (array,id) => array.find(x=>x.id===id);
  const showSource = (episode,id) => get(episode.sources,id);
  const allJudged = (items, answers) => items.every(x=>Object.hasOwn(answers,x.id));
  function compare(episode,pair) {
    if (pair.length!==2 || pair[0]===pair[1]) return null;
    const left=showSource(episode,pair[0]),right=showSource(episode,pair[1]);
    return left && right ? left.origin===right.origin ? 'shared' : 'independent' : null;
  }
  function step(s, action, e) {
    const {type,id} = action;
    const on = mode => s.page === mode;
    switch(type) {
      case 'reset': return create();
      case 'begin': return on('brief') ? {...s,page:'evidence'} : s;
      case 'view': {
        if(!on('evidence') || !showSource(e,id)) return s;
        return {...s,viewed:id,opened:s.opened.includes(id)?s.opened:[...s.opened,id]};
      }
      case 'trace': {
        if(!on('evidence') || s.viewed!==id || !s.opened.includes(id) || s.traced.includes(id)) return s;
        return {...s,traced:[...s.traced,id]};
      }
      case 'pin': {
        if(!on('evidence') || !s.opened.includes(id)) return s;
        const pair = s.pair.includes(id) ? s.pair.filter(x=>x!==id) : [...s.pair,id].slice(-2);
        return {...s,pair,relation:null,compared:false};
      }
      case 'relation': return on('evidence') && !s.compared && compare(e,s.pair) && get(e.relationships,id) ? {...s,relation:id} : s;
      case 'compare': return on('evidence') && compare(e,s.pair) && s.relation ? {...s,compared:true} : s;
      case 'claim': return on('evidence') && s.compared && get(e.claims,id) && get(e.verdicts,action.value)
        ? {...s,claims:{...s.claims,[id]:action.value}} : s;
      case 'decide': return on('evidence') && s.compared && allJudged(e.claims,s.claims) ? {...s,page:'decide'} : s;
      case 'evidence': return on('decide') ? {...s,page:'evidence'} : s;
      case 'choose': return on('decide') && get(e.decisions,id) ? {...s,decision:id} : s;
      case 'commit': return on('decide') && get(e.decisions,s.decision) ? {...s,page:'review'} : s;
      case 'followup': return on('review') && get(e.repairs[s.decision]||[],id) ? {...s,page:'debrief',repair:id} : s;
      case 'transfer': return on('debrief') && !s.checked && get(e.transfer.items,id) && get(e.verdicts,action.value)
        ? {...s,transfer:{...s.transfer,[id]:action.value}} : s;
      case 'check': return on('debrief') && allJudged(e.transfer.items,s.transfer) ? {...s,checked:true} : s;
      default: return s;
    }
  }
  function rows(items,answers) { return items.map(x=>({id:x.id,correct:answers[x.id]===x.verdict,actual:x.verdict,chosen:answers[x.id]||null})); }
  const api={create,step,compare,allJudged,phases,rows,get};
  if(typeof module!=='undefined'&&module.exports) module.exports=api; else env.TrollEngine=api;
})(globalThis);
