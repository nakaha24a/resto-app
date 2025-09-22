import React, { useState } from "react";
import { Member } from "../types";

interface PartyInputProps {
  onStartOrder: (members: Member[]) => void;
}

const PartyInputScreen: React.FC<PartyInputProps> = ({ onStartOrder }) => {
  const [memberCount, setMemberCount] = useState<number | string | string>(1);
  const [members, setMembers] = useState<Member[]>([{ id: 1, name: "" }]);

  const handleMemberCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setMemberCount(value);

      const count = Number(value);
      if (count >= 1) {
        const newMembers: Member[] = [];
        for (let i = 0; i < count; i++) {
          newMembers.push({
            id: i + 1,
            name: members[i]?.name || "",
          });
        }
        setMembers(newMembers);
      } else if (value === "") {
        setMembers([]);
      }
    }
  };

  const handleNameChange = (id: number, newName: string) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === id ? { ...member, name: newName } : member
      )
    );
  };

  const handleSubmit = () => {
    const finalCount = typeof memberCount === 'string' ? parseInt(memberCount, 10) : memberCount;
    const count = finalCount > 0 ? finalCount : 1;

    const finalizedMembers: Member[] = [];
    for (let i = 0; i < count; i++) {
      const existingMember = members.find(m => m.id === i + 1);
      finalizedMembers.push({
        id: i + 1,
        name: existingMember?.name || `参加者${i + 1}`,
      });
    }

    onStartOrder(finalizedMembers);
  };

  return (
    <div className="screen party-input-screen">
      <h2>メンバー人数・名前入力</h2>
      <div className="form-group">
        <label>人数：</label>
        <input
          type="text"
          type="text"
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