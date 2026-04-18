import User from "../models/User.js";

// ================= GET ALL USERS =================
// Only principal/admin should access this
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: { $ne: true } })
      .select("-password -refresh_token");

    return res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ================= GET SINGLE USER =================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password -refresh_token");

    if (!user || user.isDeleted) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("GET USER ERROR:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // ❌ Prevent updating sensitive fields
    delete updates.password;
    delete updates.refresh_token;
    delete updates.role; // role should be controlled separately

    const user = await User.findById(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Optional: allow user to update only their own data
    if (req.user.id !== id && req.user.role !== "principal") {
      return res.status(403).json({ msg: "Access denied" });
    }

    Object.assign(user, updates);

    await user.save();

    return res.json({
      msg: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ================= DELETE USER (SOFT DELETE) =================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Only principal can delete
    if (req.user.role !== "principal") {
      return res.status(403).json({ msg: "Only principal can delete users" });
    }

    user.isDeleted = true;
    await user.save();

    return res.json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};