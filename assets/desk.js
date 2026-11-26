(function () {
  'use strict';
  const E=window.TrollEpisode, G=window.TrollEngine;
  const desk=document.querySelector('#desk'), workflow=document.querySelector('#workflow'), bar=document.querySelector('#progress');
  const reset=document.querySelector('#restart'), dialog=document.querySelector('#confirm');
  let state=G.create(), restore=null;
  const labels={brief:'Brief',evidence:'Evidence',decide:'Decision',review:'Review',debrief:'Debrief'};
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const e=esc, get=G.get, sym=(k)=>({post:'≋',paper:'▤',door:'◇',note:'↳'}[k]||'•');
  const button=(type, label, {id='',klass='primary',disabled=false,extra=''}={})=>
    `<button type="button" class="${klass}" id="${e(type+(id?'-'+id:''))}" data-act="${e(type)}" ${id?`data-id="${e(id)}"`:''}${disabled?' disabled':''}${extra?' '+extra:''}>${e(label)}</button>`;
  const select=(action,id,options,current,text)=>`<label class="judgement"><span>${e(text)}</span><select id="${action}-${id}" data-act="${action}" data-id="${id}" required><option value="" disabled${current?'':' selected'}>Choose status</option>${options.map(o=>`<option value="${e(o.id)}"${o.id===current?' selected':''}>${e(o.label)}</option>`).join('')}</select></label>`;
  const title=(k,t,lead)=>`<section class="page-title"><p class="kicker">${e(k)}</p><h1 tabindex="-1" id="scene-title">${e(t)}</h1><p class="lede">${e(lead)}</p></section>`;
  const verdict=id=>get(E.verdicts,id)?.label||'No judgment';
  function brief() {
    return `<section class="hero"><div class="hero-copy"><p class="kicker"><i></i> CASE ${e(E.caseNo)} <span>·</span> ${e(E.place)}</p><h1 tabindex="-1" id="scene-title">${(E.titleLines||[E.title]).map(e).join('<br> ')}</h1><p class="lede">${e(E.intro)}</p><div class="actions"><span class="seat">${e(E.role)} · ${e(E.duration)}</span>${button('begin','Open the case →')}</div></div><figure class="map"><img src="assets/harbor.svg" alt="" width="840" height="652"><figcaption><span>HARBOR HALL · ALDERHAVEN</span><span>Case illustration</span></figcaption></figure></section>
    <aside class="wire brief-wire" aria-label="Newsroom message"><div class="call-sign" aria-hidden="true">MV</div><div><p class="kicker">${e(E.editor)} · ${e(E.editorRole)} · ${e(E.time)}</p><q>${e(E.prompt)}</q></div></aside>`;
  }
  function sourceCard(s) {
    const opened=state.opened.includes(s.id), pinned=state.pair.includes(s.id);
    return `<li><button type="button" id="view-${e(s.id)}" class="source-button ${state.viewed===s.id?'selected':''}" aria-controls="source-reader" aria-expanded="${state.viewed===s.id}" data-act="view" data-id="${e(s.id)}"><span class="source-glyph" aria-hidden="true">${e(s.no)}</span><span><strong>${e(s.name)}</strong><small>${e(s.type)} · ${e(s.at)}</small></span><span class="source-state">${pinned?'Pinned':opened?'Opened':'Open'} <span aria-hidden="true">↗</span></span></button></li>`;
  }
  function reader() {
    const s=get(E.sources,state.viewed);
    if (!s) return `<article class="reader no-source" id="source-reader"><p class="kicker">READER</p><h2>Open a source</h2><p>Read what it actually says, then pin two sources to compare where they got their information.</p></article>`;
    const traced=state.traced.includes(s.id),pinned=state.pair.includes(s.id);
    return `<article class="reader" data-source-kind="${e(s.icon)}" id="source-reader"><p class="kicker">EXHIBIT ${e(s.no)} / ${e(s.type.toUpperCase())}</p><h2 id="reader-title" tabindex="-1">${e(s.name)}</h2><div class="evidence-document"><p class="byline"><span aria-hidden="true">${sym(s.icon)}</span> ${e(s.by)} · ${e(s.at)}</p><blockquote>${e(s.text)}</blockquote></div><p class="source-context">${e(s.meta)}</p><div class="actions">${button('pin',pinned?'Unpin source':'Pin to compare',{id:s.id,klass:'secondary',extra:`aria-pressed="${pinned}"`})}${button('trace',traced?'Origin revealed':'Trace its origin',{id:s.id,klass:'ghost',disabled:traced})}<a class="back-to-sources" href="#sources-title">← Sources</a></div>
     ${traced?`<p class="origin" id="origin-note" tabindex="-1"><strong>Provenance.</strong> ${e(s.lineage)}</p>`:''}</article>`;
  }
  function compareBlock() {
    const pair=state.pair.map(id=>get(E.sources,id));
    const result=G.compare(E,state.pair);
    return `<section class="compare" aria-labelledby="compare-title"><div class="panel-heading"><div><p class="kicker">CROSS-CHECK</p><h2 id="compare-title">Compare two sources</h2></div><span class="count">${pair.length}/2 pinned</span></div>
    <div class="pair">${[0,1].map(i=>pair[i]?`<article><p class="kicker">${e(pair[i].at)} · ${e(pair[i].type)}</p><h3>${e(pair[i].name)}</h3><p>${e(pair[i].text)}</p>${state.traced.includes(pair[i].id)?`<small>${e(pair[i].lineage)}</small>`:''}</article>`:`<div class="empty">Pin another source to compare</div>`).join('')}</div>
    ${result?state.compared?`<div class="feedback" id="comparison-feedback" tabindex="-1"><strong>${state.relation===result?'Right:':'Recheck:'} ${e(get(E.relationships,result).label)}.</strong> ${result==='shared'?'Two versions of the same material count as one origin, not corroboration.':'These sources do not borrow from each other. Independent accounts support only what those sources observed.'}</div>`:`<div class="compare-controls"><label for="relation-choice">Do they draw on the same source?</label><select id="relation-choice" data-act="relation"><option value="" disabled${state.relation?'':' selected'}>Choose relationship</option>${E.relationships.map(x=>`<option value="${e(x.id)}"${state.relation===x.id?' selected':''}>${e(x.label)}</option>`).join('')}</select>${button('compare','Check comparison',{disabled:!state.relation,klass:'secondary'})}</div>`:''}</section>`;
  }
  function coverageTip() {
    const todo=(E.coverage?.recommended||[]).filter(id=>!state.opened.includes(id)).map(id=>get(E.sources,id));
    return todo.length ? `<aside class="coverage-tip"><p><strong>Still worth checking:</strong> ${e(E.coverage.question)}</p><div class="actions">${state.page==='evidence'?todo.map(s=>button('view',s.name,{id:s.id+'-from-tip',klass:'secondary',extra:`data-source="${e(s.id)}"`})).join(''):button('evidence','← Check these sources',{id:'from-tip',klass:'secondary'})}</div></aside>`:'';
  }
  function evidence() {
    const judged=G.allJudged(E.claims,state.claims);
    return title('01 / EVIDENCE DESK','What does the evidence show?','Open two or more sources. Compare their origins, then make a claim-by-claim judgment.')+
      `<div class="evidence-grid"><aside class="sources"><div class="panel-heading"><div><p class="kicker">CASE FILE</p><h2 id="sources-title" tabindex="-1">Sources</h2></div><span class="count">${state.opened.length}/${E.sources.length} opened</span></div><ul>${E.sources.map(sourceCard).join('')}</ul></aside>${reader()}</div>
       ${compareBlock()}
       ${state.compared?coverageTip():''}
       ${state.compared?`<section class="judge" aria-labelledby="judgement-title"><p class="kicker">YOUR READ</p><h2 id="judgement-title">Assess each claim</h2><p>Use supported, misleading, or unresolved. These are not votes on the source.</p>${E.claims.map(x=>select('claim',x.id,E.verdicts,state.claims[x.id],x.text)).join('')}<div class="actions">${button('decide','Go to the decision →',{disabled:!judged})}</div></section>`:''}`;
  }
  function decide() {
    return title('02 / EDITORIAL DECISION','What goes in the feed?',`Choose what residents see at ${E.decisionTime}. Review the wording before committing.`)+
     `${coverageTip()}<fieldset class="choices"><legend class="sr">Choose a publishing decision</legend>${E.decisions.map(d=>`<label class="choice"><input type="radio" name="decision" id="choose-${d.id}" data-act="choose" data-id="${d.id}"${state.decision===d.id?' checked':''}><span><strong>${e(d.title)}</strong><span>${e(d.description)}</span><q class="choice-copy">${e(d.copy.replace(/^“|”$/g,''))}</q></span></label>`).join('')}</fieldset>
      <div class="actions decision-actions">${button('evidence','← Back to evidence',{klass:'ghost'})}${button('commit','Send editorial decision →',{disabled:!state.decision})}</div>`;
  }
  function review() {
    const d=get(E.decisions,state.decision);
    return title('03 / IN THE PUBLIC FEED',d.outcome,'See how your choice affects a reader, then respond to a new confirmation.')+
      `<div class="outcome-grid"><section class="record"><p class="kicker">${e(E.decisionTime)} / YOUR NEWSROOM RECORD</p><h2>${e(d.title)}</h2><ul>${d.records.map(x=>`<li>${e(x)}</li>`).join('')}</ul><p class="feedback">${e(d.feedback)}</p></section>
       <aside class="wire impact"><div class="call-sign" aria-hidden="true">↳</div><div><p class="kicker">${e(d.actor.toUpperCase())}</p><q>${e(d.quote)}</q></div></aside></div>
       <section class="followup"><p class="kicker">NEW WIRE / ${e(E.followup.time)}</p><h2>${e(E.followup.by)}</h2><p>${e(E.followup.text)}</p><div class="repairs">${E.repairs[d.id].map(r=>`<article><h3>${e(r.title)}</h3><p>${e(r.copy)}</p><p class="muted">${e(r.note)}</p>${button('followup',r.title,{id:r.id,klass:'secondary'})}</article>`).join('')}</div></section>`;
  }
  const results=(items,answers)=>`<ul class="results">${G.rows(items,answers).map((r,i)=>`<li><span class="result-tag ${r.correct?'pass':'retry'}">${r.correct?'Matched':'Recheck'}</span><div><strong>${e(items[i].text)}</strong><p>${e(verdict(r.actual))}. ${e(items[i].why)}${r.correct?'':` <span class="muted">You chose: ${e(verdict(r.chosen))}.</span>`}</p></div></li>`).join('')}</ul>`;
  function debrief() {
    const d=get(E.decisions,state.decision),r=get(E.repairs[d.id],state.repair);
    return title('04 / DEBRIEF','Read the record.','Explain what you knew, what you didn’t, and why your next action mattered.')+
     `<section class="record debrief-record"><p class="kicker">ON THE RECORD</p><h2>${e(r.title)}</h2><p>${e(r.end)}</p><p><strong>Think or discuss:</strong> Which two sources would you cite for the location? What evidence would you need to report a motive?</p></section>
       <section class="judge"><p class="kicker">CHECK YOUR REASONING</p><h2>The three claims</h2>${results(E.claims,state.claims)}</section>
       <section class="transfer judge"><p class="kicker">TRANSFER / NEW TIP</p><h2>Would you report it?</h2><p>${e(E.transfer.prompt)}</p><ul class="transfer-sources">${E.transfer.sources.map(x=>`<li><strong>${e(x.title)}</strong><p>${e(x.text)}</p></li>`).join('')}</ul>
       ${state.checked?`<div id="transfer-results" tabindex="-1"><h3>Check your transfer</h3>${results(E.transfer.items,state.transfer)}<p class="keep"><strong>Take it with you:</strong> A source can verify one detail without verifying a whole story. Find the original, corroborate independently, and say what remains unknown.</p><div class="actions"><a class="secondary link-button" href="takeaway.html">Printable takeaway ↗</a>${button('done','Play again',{klass:'ghost'})}</div></div>`:
       E.transfer.items.map(x=>select('transfer',x.id,E.verdicts,state.transfer[x.id],x.text)).join('')+`<div class="actions">${button('check','Check the new tip →',{disabled:!G.allJudged(E.transfer.items,state.transfer)})}</div>`
       }</section>`;
  }
  const renderers={brief,evidence,decide,review,debrief};
  function render(focus) {
    workflow.hidden=state.page==='brief';
    bar.innerHTML=G.phases.slice(1).map((key,i)=>`<li${state.page===key?' aria-current="step"':''} class="${G.phases.indexOf(state.page)>i+1?'complete':''}"><span>${i+1}</span>${e(labels[key])}</li>`).join('');
    desk.innerHTML=renderers[state.page]();
    if(focus) document.getElementById(focus)?.focus({preventScroll:false});
  }
  function dispatch(a, target) {
    const prev=state;
    state=G.step(state,a,E);
    if(state===prev) return;
    window.TrollTheme?.syncLinks();
    const changesPage=state.page!==prev.page;
    if(changesPage) window.scrollTo(0,0);
    if(['claim','transfer','relation','choose'].includes(a.type)) {
      // Keep native select/radio focus and keyboard arrow selection.
      for(const [id,enabled] of [
        ['decide',G.allJudged(E.claims,state.claims)],['check',G.allJudged(E.transfer.items,state.transfer)],
        ['compare',Boolean(state.relation)],['commit',Boolean(state.decision)]]) {
        const b=document.getElementById(id); if(b) b.disabled=!enabled;
      }
      return;
    }
    if(a.type==='view') {
      const narrow=window.matchMedia('(max-width: 680px)').matches;
      return render(narrow||target.endsWith('-from-tip')?'reader-title':target);
    }
    render(changesPage?'scene-title':({trace:'origin-note',compare:'comparison-feedback',check:'transfer-results'}[a.type]||target));
  }
  desk.addEventListener('click',event=>{
    const target=event.target.closest('button[data-act]');
    if(!target) return;
    if(target.dataset.act==='done') return confirmReset(target);
    dispatch({type:target.dataset.act,id:target.dataset.source||target.dataset.id},target.id);
  });
  desk.addEventListener('change',event=>{
    const target=event.target;
    if(target.matches('select[data-act],input[data-act]'))
      dispatch({type:target.dataset.act,id:target.dataset.id||target.value,value:target.value},target.id);
  });
  function confirmReset(el) { restore=el; dialog.returnValue=''; dialog.showModal(); }
  reset.addEventListener('click',()=>confirmReset(reset));
  dialog.addEventListener('close',()=>{
    if(dialog.returnValue==='restart') { state=G.create(); window.scrollTo(0,0); render('scene-title'); }
    else restore?.focus();
    restore=null;
  });
  render();
})();
