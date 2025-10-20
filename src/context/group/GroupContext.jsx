import groupService from "../../services/groupService";
import { GroupContext } from "./groupContext";

export const GroupProvider = ({ children }) => {
  const handleCreate = async (payload) => {
    try {
      const res = await groupService.create(payload);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      const res = await groupService.update(id, payload);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await groupService.remove(id);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleGetAll = async () => {
    try {
      const res = await groupService.getAll();
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  const handleGetById = async (id) => {
    try {
      const res = await groupService.getById(id);
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: String(err.message || err) };
    }
  };

  return (
    <GroupContext.Provider
      value={{
        handleCreate,
        handleUpdate,
        handleRemove,
        handleGetAll,
        handleGetById,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
