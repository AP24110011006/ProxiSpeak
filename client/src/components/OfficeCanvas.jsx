import { useEffect, useState } from "react";

function OfficeCanvas() {
  const [position, setPosition] = useState({
    x: 50,
    y: 50,
  });

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key.toLowerCase();

      const movements = {
        arrowup: [0, -3],
        w: [0, -3],
        arrowdown: [0, 3],
        s: [0, 3],
        arrowleft: [-3, 0],
        a: [-3, 0],
        arrowright: [3, 0],
        d: [3, 0],
      };

      if (!movements[key]) return;

      event.preventDefault();

      const [dx, dy] = movements[key];

      setPosition((previous) => ({
        x: Math.max(5, Math.min(95, previous.x + dx)),
        y: Math.max(8, Math.min(90, previous.y + dy)),
      }));
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <section className="office-container">
      <div className="office-title">🏢 Team Office</div>

      <div className="office-floor">
        <div className="room-label meeting-label">
          Meeting Area
        </div>

        <div className="room-label team-label">
          Team Space
        </div>

        <div className="desk desk-one">Desk 01</div>
        <div className="desk desk-two">Desk 02</div>
        <div className="desk desk-three">Desk 03</div>
        <div className="desk desk-four">Desk 04</div>

        <div className="shared-workspace">
          <h3>Shared Workspace</h3>
          <p>Collaborate with your team</p>
        </div>

        <div
          className="avatar"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
          }}
        >
          <div className="avatar-head">H</div>
          <div className="avatar-body"></div>
          <span className="avatar-name">You</span>
        </div>
      </div>

      <p className="position">
        Position: X = {position.x}, Y = {position.y}
      </p>
    </section>
  );
}

export default OfficeCanvas;