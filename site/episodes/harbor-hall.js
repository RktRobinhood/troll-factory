/* Original fictional classroom case. A classic script enables offline file://. */
(function (env) {
  'use strict';
  const episode = {
    id: 'harbor-hall', version: 1, title: 'The Harbor Hall Tip', titleLines: ['The Harbor', 'Hall Tip'], caseNo: '01', place: 'Alderhaven', time: '16:40', decisionTime: '16:45', duration: '12–15 min', role: 'Desk editor', editor: 'Mara Venn', editorRole: 'Shift lead',
    intro: 'A widely shared screenshot says tonight’s public flood-plan meeting has been cancelled. Residents are deciding whether to go. You have to decide what the Harbor Desk can report.',
    prompt: 'What can you tell residents before they leave home?',
    claim: 'Tonight’s flood-plan meeting is cancelled.',
    sources: [
      {id:'post', no:'01', icon:'post', name:'The circulating post', by:'Alderhaven Noticeboard', at:'16:08', type:'Community post',
       text:'Harbor Hall cancelled tonight. They don’t want people at the flood-plan vote.',
       meta:'The attached image ends at the words “Harbor Hall booking cancelled”. No link, signature, or document page number is visible.',
       lineage:'The post reproduces part of the town clerk’s 15:54 notice. It is not a separate account of what happened.', origin:'clerk'},
      {id:'notice', no:'02', icon:'paper', name:'The full venue notice', by:'Town clerk’s public register', at:'15:54', type:'Original document',
       text:'Harbor Hall booking cancelled. Flood-plan meeting moved to Tide Library, Room 2, at 18:00 today. The published agenda is unchanged.',
       meta:'Docket AH-17. The register records what was announced. It gives no reason for the venue change.',
       lineage:'The original register entry. The circulating post crops this exact document, so these two items share one origin.', origin:'clerk'},
      {id:'library', no:'03', icon:'door', name:'The room check', by:'Nia Vale, library duty lead', at:'16:24', type:'Firsthand account',
       text:'I unlocked Room 2 and saw the flood-plan meeting sign. We’re setting out chairs for 18:00.',
       meta:'Your colleague spoke to Nia on duty at Tide Library. Nia describes what she saw and did, not why the council moved.',
       lineage:'A firsthand account from the new venue. Nia’s observation does not come from the cropped post or town register.', origin:'library'},
      {id:'resident', no:'04', icon:'note', name:'A resident’s message', by:'Oren Moss, Harbor Lane resident', at:'16:31', type:'Direct message',
       text:'I went to Harbor Hall: the outer doors were locked. I can’t tell what that means for tonight.',
       meta:'Oren was at the old venue only. A locked door is compatible with a move, a cancellation, or another closure. It establishes only that this entrance was shut.',
       lineage:'Independent observation at the old venue. It supports only the claim that this entrance was shut.', origin:'resident'}
    ],
    coverage: { recommended:['notice','library'], question:'For the venue and time, compare the full notice with a firsthand check.' },
    relationships: [
      {id:'independent', label:'Independent accounts'},
      {id:'shared', label:'One origin repeated'}
    ],
    claims: [
      {id:'move', text:'The meeting is scheduled at Tide Library, Room 2, at 18:00.', verdict:'supported', why:'The complete notice specifies the new venue and time. The library duty lead independently confirms preparations.'},
      {id:'cancel', text:'The public meeting was cancelled.', verdict:'misleading', why:'The crop mistakes a cancelled room booking for a cancelled meeting.'},
      {id:'intent', text:'The venue was changed to keep residents away.', verdict:'unresolved', why:'No available source establishes anyone’s intent. Absence of evidence does not prove the opposite.'}
    ],
    verdicts:[
      {id:'supported',label:'Supported'}, {id:'misleading',label:'Misleading'}, {id:'unresolved',label:'Unresolved'}
    ],
    decisions:[
      {id:'publish', title:'Publish as stated', copy:'“Tonight’s flood-plan meeting is cancelled.”', description:'Send the incoming claim as a straight alert.',
       outcome:'Some readers change their plans.', actor:'Resident message · 16:55', quote:'I cancelled my lift when I saw your alert. Is the meeting really off?',
       records:['Your alert says the meeting is cancelled.', 'One reader cancels a ride. Another asks the library for clarification.'],
       feedback:'A locked old venue and a cropped notice cannot establish cancellation. The missing part of the notice changes the meaning.'},
      {id:'qualify', title:'Publish with limits', copy:'“Flood-plan meeting scheduled for 18:00 at Tide Library, Room 2. We haven’t verified why it moved.”', description:'Publish the location and time, with a limit on what you know.',
       outcome:'Readers have a place to go.', actor:'Resident message · 16:55', quote:'I can tell my neighbour which building to use. Got it: you don’t know why it moved.',
       records:['Residents receive the verified location and time.', 'The reason for the move is left open.'],
       feedback:'The notice plus the independent room check warrant practical information. Neither source establishes a motive.'},
      {id:'hold', title:'Hold for another check', copy:'No public alert yet.', description:'Keep the story private and seek confirmation.',
       outcome:'No wrong alert goes out.', actor:'Resident message · 16:55', quote:'We’re about to leave. Is there anything you can confirm yet?',
       records:['No newsroom claim appears in the feed.', 'Some readers still make plans from the original rumour.'],
       feedback:'Holding can be reasonable when evidence is weak. Here the already-supported location was useful and could have been shared without asserting a motive.'}
    ],
    followup:{time:'17:18', by:'Town clerk’s schedule update', text:'“The flood-plan meeting is on as scheduled, 18:00, Tide Library Room 2.” The reason for the move is still not published.'},
    repairs:{
       publish:[{id:'repair',title:'Post a visible correction',copy:'“We wrongly reported the meeting was cancelled. It is on at 18:00, Tide Library, Room 2.”',note:'Tie the correction to your original alert.',end:'The correction gives readers the right venue and acknowledges the error. It cannot undo a missed lift or guarantee that everyone sees it.'},
                {id:'wait',title:'Leave the earlier alert',copy:'Keep the original unchanged.',note:'The record continues to say the meeting was cancelled.',end:'The wrong alert remains the latest thing some readers see. Silence leaves the newsroom’s error uncorrected.'}],
       qualify:[{id:'repair',title:'Add a clearly labelled update',copy:'“Update: the clerk has confirmed the meeting is still on at Tide Library, Room 2, at 18:00.”',note:'Separate the update from the original account.',end:'The public record distinguishes initial evidence from later confirmation. The reason for the move stays unresolved.'},
                {id:'wait',title:'Keep the accurate notice',copy:'No new alert. Keep the original wording.',note:'Your original wording was already accurate.',end:'The original still gives the correct time and venue. Keeping it is defensible; a labelled update would show that confirmation arrived.'}],
       hold:[{id:'repair',title:'Publish a sourced update',copy:'“The clerk confirms tonight’s meeting at 18:00, Tide Library, Room 2.”',note:'Tell people what you can now confirm.',end:'Readers finally have the venue and time, though some had to plan without the newsroom’s help.'},
             {id:'wait',title:'Keep holding',copy:'No public update.',note:'The confirmed location stays in the newsroom.',end:'No false claim comes from the newsroom, but the people relying on it still have no verified directions.'}]
    },
    transfer: {
      prompt:'A new tip claims visits to the town museum rose by 60% over the whole year.',
      sources:[
        {title:'Town museum’s door counter',text:'One opening Saturday: 80 visits the previous year, 128 this year. Annual totals are still being compiled.'},
        {title:'Independent volunteer tally',text:'I counted 128 visitors myself this opening Saturday. This year’s opening Saturday had free entry.'},
        {title:'Two reposts',text:'Both show the same museum chart labelled “+60%”. Its original caption says “Opening Saturday only”.'}
      ],
      items:[
        {id:'museum-year',text:'“The +60% chart measures the change in visits over the full year.”', verdict:'misleading', why:'The chart compares two opening Saturdays, not two full years. The actual change in annual visits remains unresolved.'},
        {id:'museum-count',text:'“128 people visited this opening Saturday.”', verdict:'supported', why:'The door counter and the volunteer’s separate tally agree on this day’s count.'},
        {id:'museum-cause',text:'“Free entry caused the rise in visits.”', verdict:'unresolved', why:'Free entry happened on the busier day. The evidence does not isolate its effect from other differences.'}
      ]
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = episode;
  else env.TrollEpisode = episode;
})(globalThis);
