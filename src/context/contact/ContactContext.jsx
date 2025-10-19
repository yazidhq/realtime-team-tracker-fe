import contactService from "../../services/contactService";
import { ContactContext } from "./contactContext";

export const ContactProvider = ({ children }) => {
  const handleCreate = async (payload) => {
    try {
      const res = await contactService.create(payload);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleUpdate = async (payload) => {
    try {
      const res = await contactService.update(payload);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await contactService.remove(id);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleGetAll = async () => {
    try {
      const res = await contactService.getAll();
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleGetById = async (id) => {
    try {
      const res = await contactService.getById(id);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  return (
    <ContactContext.Provider
      value={{
        handleCreate,
        handleUpdate,
        handleRemove,
        handleGetAll,
        handleGetById,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};
