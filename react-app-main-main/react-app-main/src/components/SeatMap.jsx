import React from 'react';

/* ============================================
   Seat — individual seat element
   ============================================ */
function Seat({ idx, label, isOccupied, isSelected, extraClass, onToggle, onHover, onLeave }) {
  const cls = isOccupied ? 'occupied' : isSelected ? 'selected' : 'available';

  const handleClick = () => {
    if (!isOccupied && onToggle) onToggle(idx, label);
  };

  return (
    <div
      className={`seat ${cls}${extraClass ? ' ' + extraClass : ''}`}
      data-idx={idx}
      data-label={label}
      onClick={handleClick}
      onMouseEnter={(e) => onHover && onHover(e, idx, label, cls)}
      onMouseLeave={onLeave}
    >
      {idx + 1}
    </div>
  );
}

/* ============================================
   SeatMap — renders 2D seat layout
   ============================================ */
export default function SeatMap({ roomType, occupied, selectedSeats, onToggleSeat, onHoverSeat, onLeaveSeat }) {
  const seatProps = (idx, label, extra) => ({
    idx,
    label,
    isOccupied: occupied.includes(idx),
    isSelected: selectedSeats.has(idx),
    extraClass: extra,
    onToggle: onToggleSeat,
    onHover: onHoverSeat,
    onLeave: onLeaveSeat,
  });

  if (roomType === 'auditorio' || roomType === 'general-seat') {
    return <AuditorioMap seatProps={seatProps} />;
  }
  if (roomType === 'computo') {
    return <ComputoMap seatProps={seatProps} />;
  }
  if (roomType === 'capacitacion') {
    return <CapacitacionMap seatProps={seatProps} />;
  }
  if (roomType === 'general') {
    return <GeneralMap seatProps={seatProps} />;
  }
  if (roomType === 'divided') {
    return <DividedMap seatProps={seatProps} />;
  }

  return null;
}

/* ======= Auditorio: 7 rows × 8 seats with center aisle ======= */
function AuditorioMap({ seatProps }) {
  const rows = 'ABCDEFG';
  let idx = 0;
  const rowElements = [];

  for (let r = 0; r < 7; r++) {
    const seats = [];
    for (let c = 0; c < 4; c++) {
      seats.push(<Seat key={idx} {...seatProps(idx, rows[r] + (c + 1))} />);
      idx++;
    }
    seats.push(<div className="aisle" key={`aisle-${r}`}></div>);
    for (let c = 4; c < 8; c++) {
      seats.push(<Seat key={idx} {...seatProps(idx, rows[r] + (c + 1))} />);
      idx++;
    }

    rowElements.push(
      <div className="seat-row" key={r}>
        <div className="row-label">{rows[r]}</div>
        <div className="row-seats">{seats}</div>
        <div className="row-label">{rows[r]}</div>
      </div>
    );
  }

  return <div className="seats-grid">{rowElements}</div>;
}

/* ======= Cómputo: 4 rows × 5 desk+chair pairs ======= */
function ComputoMap({ seatProps }) {
  const rows = 'ABCD';
  let idx = 0;
  const rowElements = [];

  for (let r = 0; r < 4; r++) {
    const seats = [];
    for (let c = 0; c < 5; c++) {
      const label = 'PC-' + (idx + 1);
      seats.push(
        <div className="desk-seat-pair" key={idx}>
          <div className="mini-desk" style={{ width: 36 }}></div>
          <Seat {...seatProps(idx, label, 'with-desk')} />
        </div>
      );
      idx++;
    }

    rowElements.push(
      <div className="seat-row" key={r}>
        <div className="row-label">{rows[r]}</div>
        <div className="row-seats" style={{ gap: 8 }}>{seats}</div>
        <div className="row-label">{rows[r]}</div>
      </div>
    );
  }

  return <div className="seats-grid" style={{ gap: 10 }}>{rowElements}</div>;
}

/* ======= Capacitación: 4 tables × 6 seats ======= */
function CapacitacionMap({ seatProps }) {
  const tNames = ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4'];
  let idx = 0;
  const tables = [];

  for (let t = 0; t < 4; t++) {
    const topRow = [];
    for (let c = 0; c < 3; c++) {
      const label = tNames[t] + ' L' + ((idx % 6) + 1);
      topRow.push(<Seat key={idx} {...seatProps(idx, label)} />);
      idx++;
    }
    const botRow = [];
    for (let c = 0; c < 3; c++) {
      const label = tNames[t] + ' L' + ((idx % 6) + 1);
      botRow.push(<Seat key={idx} {...seatProps(idx, label)} />);
      idx++;
    }

    tables.push(
      <div className="group-cluster" key={t}>
        <div style={{ fontSize: '.7rem', color: '#8892b0', marginBottom: 4, fontWeight: 600 }}>
          {tNames[t]}
        </div>
        <div className="group-row">{topRow}</div>
        <div className="group-table" style={{ width: 112 }}></div>
        <div className="group-row">{botRow}</div>
      </div>
    );
  }

  return <div className="groups-grid">{tables}</div>;
}

/* ======= General: 5 rows × 6 desk+chair pairs ======= */
function GeneralMap({ seatProps }) {
  const rows = 'ABCDE';
  let idx = 0;
  const rowElements = [];

  for (let r = 0; r < 5; r++) {
    const seats = [];
    for (let c = 0; c < 6; c++) {
      const label = rows[r] + (c + 1);
      seats.push(
        <div className="desk-seat-pair" key={idx}>
          <div className="mini-desk"></div>
          <Seat {...seatProps(idx, label)} />
        </div>
      );
      idx++;
    }

    rowElements.push(
      <div className="general-row" key={r}>
        <div className="row-label">{rows[r]}</div>
        {seats}
        <div className="row-label">{rows[r]}</div>
      </div>
    );
  }

  return <div className="general-grid">{rowElements}</div>;
}

/* ======= Divided: Left auditorio + Right capacitación ======= */
function DividedMap({ seatProps }) {
  const rows = 'ABCDEF';
  const tNames = ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4'];
  let idx = 0;

  // LEFT: Auditorio
  const audRows = [];
  for (let r = 0; r < 6; r++) {
    const seats = [];
    for (let c = 0; c < 4; c++) {
      seats.push(<Seat key={idx} {...seatProps(idx, 'Au-' + rows[r] + (c + 1))} />);
      idx++;
    }
    seats.push(<div className="aisle" style={{ width: 12 }} key={`aisle-${r}`}></div>);
    for (let c = 4; c < 8; c++) {
      seats.push(<Seat key={idx} {...seatProps(idx, 'Au-' + rows[r] + (c + 1))} />);
      idx++;
    }
    audRows.push(
      <div className="seat-row" key={r}>
        <div className="row-label">{rows[r]}</div>
        <div className="row-seats">{seats}</div>
        <div className="row-label">{rows[r]}</div>
      </div>
    );
  }

  // RIGHT: Capacitación
  const capTables = [];
  for (let t = 0; t < 4; t++) {
    const topRow = [];
    for (let c = 0; c < 3; c++) {
      topRow.push(<Seat key={idx} {...seatProps(idx, 'Cap-' + tNames[t] + ' L' + (c + 1))} />);
      idx++;
    }
    const botRow = [];
    for (let c = 0; c < 3; c++) {
      botRow.push(<Seat key={idx} {...seatProps(idx, 'Cap-' + tNames[t] + ' L' + (c + 4))} />);
      idx++;
    }
    capTables.push(
      <div className="group-cluster" key={t}>
        <div style={{ fontSize: '.7rem', color: '#8892b0', marginBottom: 4, fontWeight: 600 }}>
          {tNames[t]}
        </div>
        <div className="group-row">{topRow}</div>
        <div className="group-table" style={{ width: 100 }}></div>
        <div className="group-row">{botRow}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ textAlign: 'center', fontSize: '.72rem', color: '#ffd200', fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>
          🎤 AUDITORIO
        </div>
        <div className="seats-grid">{audRows}</div>
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ textAlign: 'center', fontSize: '.72rem', color: '#38ef7d', fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>
          📚 CAPACITACIÓN
        </div>
        <div className="groups-grid">{capTables}</div>
      </div>
    </div>
  );
}
