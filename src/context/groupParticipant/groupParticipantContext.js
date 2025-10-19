import { createContext, useContext } from "react";

export const GroupParticipantContext = createContext(null);
export const useGroupParticipant = () => useContext(GroupParticipantContext);
