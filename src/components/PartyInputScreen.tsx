import React, { useState } from "react";
import { Member } from "../types";

interface PartyInputProps {
  onStartOrder: (members: Member[]) => void;
}

const PartyInputScreen: React.FC<PartyInputProps> = ({ onStartOrder }) => {
  const [memberCount, setMemberCount] = useState<number>(1);
  const [members, setMembers] = useState<Member[]>([{ id: 1, name: "" }]);

  const handleMemberCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = Math.max(1, Number(e.target.value));
    setMemberCount(count);

    const newMembers: Member[] = [];
    for (let i = 0; i < count; i++) {
      newMembers.push({
        id: i + 1,
        name: members[i]?.name || "",
      });
    }
    setMembers(newMembers);
  };

  const handleNameChange = (id: number, newName: string) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === id ? { ...member, name: newName } : member
      )
    );
  };

  const handleSubmit = () => {
    const finalizedMembers: Member[] = members.map((member) => ({
      ...member,
      name: member.name || `参加者${member.id}`,
    }));
    onStartOrder(finalizedMembers);
  };

  return (
    <div className="screen party-input-screen">
      <h2>メンバー人数・名前入力</h2>
      <div className="form-group">
        <label>人数：</label>
        <input
          type="number"
          min="1"
          value={memberCount}
          onChange={handleMemberCountChange}
        />
      </div>
      <div className="members-list">
        {members.map((member) => (
          <div key={member.id} className="member-input">
            <label>参加者{member.id}:</label>
            <input
              type="text"
              placeholder={`名前 (任意)`}
              value={member.name}
              onChange={(e) => handleNameChange(member.id, e.target.value)}
            />
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>注文開始</button>
    </div>
  );
};

export default PartyInputScreen;
