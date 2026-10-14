function Sidebar() {
  const teamMembers = [
    {
      id: 1,
      name: "You",
      role: "Frontend Developer",
      status: "Online",
    },
    {
      id: 2,
      name: "Teammate 1",
      role: "Developer",
      status: "Offline",
    },
    {
      id: 3,
      name: "Teammate 2",
      role: "Developer",
      status: "Offline",
    },
  ];

  return (
    <aside className="sidebar">
      <h2>Team Members</h2>

      {teamMembers.map((member) => (
        <div className="member" key={member.id}>
          <div className="member-avatar">
            {member.name.charAt(0)}
          </div>

          <div className="member-info">
            <h4>{member.name}</h4>
            <p>{member.role}</p>
            <span
              className={
                member.status === "Online"
                  ? "online"
                  : "offline"
              }
            >
              ● {member.status}
            </span>
          </div>
        </div>
      ))}

      <div className="connection-status">
        <h3>Connection</h3>
        <p>● Demo mode</p>
        <small>Multiplayer connection not configured yet.</small>
      </div>
    </aside>
  );
}

export default Sidebar;