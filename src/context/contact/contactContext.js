import { createContext, useContext } from "react";

export const ContactContext = createContext(null);
export const useContact = () => useContext(ContactContext);
