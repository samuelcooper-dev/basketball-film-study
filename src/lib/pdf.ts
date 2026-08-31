import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GameSession, GameStats, Roster } from '../types';

export function generateGamePDF(
  game: GameSession,
  stats: GameStats,
  roster: Roster
): Blob {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text(`${roster.teamName} Film Study Report`, 14, 20);

  doc.setFontSize(12);
  doc.text(`Opponent: ${game.opponentName}`, 14, 30);
  doc.text(`Date: ${game.date}`, 14, 37);
  doc.text(`Video: ${game.videoUrl}`, 14, 44);

  let yPos = 55;

  // Box Score Table
  doc.setFontSize(14);
  doc.text('Box Score', 14, yPos);
  yPos += 5;

  const boxScoreHeaders = [
    '#', 'Player', 'PTS', 'FG', '3PT', 'FT',
    'OREB', 'DREB', 'AST', 'TOV', 'STL', 'BLK', 'PF'
  ];

  const boxScoreRows = stats.playerStats.map(ps => [
    ps.playerNumber,
    ps.playerName,
    ps.points,
    `${ps.fgMade}/${ps.fgAttempts}`,
    `${ps.threeMade}/${ps.threeAttempts}`,
    `${ps.ftMade}/${ps.ftAttempts}`,
    ps.rebOff,
    ps.rebDef,
    ps.assists,
    ps.turnovers,
    ps.steals,
    ps.blocks,
    ps.fouls
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [boxScoreHeaders],
    body: boxScoreRows,
    theme: 'grid',
    styles: { fontSize: 8 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Advanced Stats Table
  doc.setFontSize(14);
  doc.text('Advanced Stats', 14, yPos);
  yPos += 5;

  const advancedHeaders = ['#', 'Player', '+/-', 'Screen Ast', 'Defl', 'Charges', 'Blown Cov', 'Help D Fail'];
  const advancedRows = stats.playerStats.map(ps => [
    ps.playerNumber,
    ps.playerName,
    ps.plusMinus > 0 ? `+${ps.plusMinus}` : ps.plusMinus,
    ps.screenAssists,
    ps.deflections,
    ps.chargesTaken,
    ps.blownCoverages,
    ps.helpDBreakdowns
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [advancedHeaders],
    body: advancedRows,
    theme: 'grid',
    styles: { fontSize: 8 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Opponent Scoring
  if (stats.opponentScoring.length > 0) {
    doc.setFontSize(14);
    doc.text('Opponent Scoring', 14, yPos);
    yPos += 5;

    const oppHeaders = ['Jersey #', 'Points'];
    const oppRows = stats.opponentScoring.map(opp => [opp.jerseyNumber, opp.points]);

    autoTable(doc, {
      startY: yPos,
      head: [oppHeaders],
      body: oppRows,
      theme: 'grid',
      styles: { fontSize: 8 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // New page for event timeline
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.text('Event Timeline', 14, yPos);
  yPos += 5;

  const timelineHeaders = ['Time', 'Event', 'Player(s)', 'Comment'];
  const timelineRows = game.events
    .sort((a, b) => a.timestampSec - b.timestampSec)
    .map(evt => {
      const mins = Math.floor(evt.timestampSec / 60);
      const secs = Math.floor(evt.timestampSec % 60);
      const timestamp = `${mins}:${secs.toString().padStart(2, '0')}`;

      const players: string[] = [];
      if (evt.primaryPlayerId) {
        const player = roster.players.find(p => p.id === evt.primaryPlayerId);
        if (player) players.push(`#${player.number} ${player.name}`);
      }
      if (evt.secondaryPlayerId) {
        const player = roster.players.find(p => p.id === evt.secondaryPlayerId);
        if (player) players.push(`#${player.number} ${player.name}`);
      }
      if (evt.opponentNumber) {
        players.push(`Opp #${evt.opponentNumber}`);
      }

      return [
        timestamp,
        evt.eventType.replace(/_/g, ' '),
        players.join(', '),
        evt.comment
      ];
    });

  autoTable(doc, {
    startY: yPos,
    head: [timelineHeaders],
    body: timelineRows,
    theme: 'striped',
    styles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 30 },
      2: { cellWidth: 50 },
      3: { cellWidth: 'auto' }
    }
  });

  // Problem Areas Summary
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.text('Problem Areas / Blame Summary', 14, yPos);
  yPos += 10;

  const problemStats = stats.playerStats
    .filter(ps => ps.turnovers > 0 || ps.blownCoverages > 0 || ps.helpDBreakdowns > 0)
    .map(ps => ({
      player: `#${ps.playerNumber} ${ps.playerName}`,
      turnovers: ps.turnovers,
      blownCov: ps.blownCoverages,
      helpDFail: ps.helpDBreakdowns
    }));

  if (problemStats.length > 0) {
    const problemHeaders = ['Player', 'Turnovers', 'Blown Coverage', 'Help D Breakdown'];
    const problemRows = problemStats.map(p => [p.player, p.turnovers, p.blownCov, p.helpDFail]);

    autoTable(doc, {
      startY: yPos,
      head: [problemHeaders],
      body: problemRows,
      theme: 'grid',
      styles: { fontSize: 9 }
    });
  } else {
    doc.setFontSize(10);
    doc.text('No turnovers or defensive breakdowns recorded.', 14, yPos);
  }

  return doc.output('blob');
}
