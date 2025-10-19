import groupParticipantService from "../../services/groupParticipantService";
import { GroupParticipantContext } from "./groupParticipantContext";

export const GroupParticipantProvider = ({ children }) => {
  const handleCreate = async (payload) => {
    try {
      const res = await groupParticipantService.create(payload);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleUpdate = async (payload) => {
    try {
      const res = await groupParticipantService.update(payload);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await groupParticipantService.remove(id);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleGetAll = async () => {
    try {
      const res = await groupParticipantService.getAll();
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleGetById = async (id) => {
    try {
      const res = await groupParticipantService.getById(id);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  return (
    <GroupParticipantContext.Provider
      value={{
        handleCreate,
        handleUpdate,
        handleRemove,
        handleGetAll,
        handleGetById,
      }}
    >
      {children}
    </GroupParticipantContext.Provider>
  );
};
