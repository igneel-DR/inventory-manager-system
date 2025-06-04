import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

// UI Components
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { AlertDialog } from "../components/ui/alert-dialog";
import { Card, CardContent } from "../components/ui/card";

// User Management Components
import { UserTable } from "../components/user-management/UserTable";
import { UserManagementHeader } from "../components/user-management/UserManagementHeader";
import { AddUserForm } from "../components/user-management/AddUserForm";
import { EditUserForm } from "../components/user-management/EditUserForm";
import { DeleteUserDialog } from "../components/user-management/DeleteUserDialog";

// Icons
import { Loader2 } from "lucide-react";

// Auth
import { useAuth } from "../context/AuthContext";

// Constants
const USER_ROLES = ["admin", "accountant", "stock_manager"];
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function UserManagementPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // User data states
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "stock_manager", // Default role
  });
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // API Calls
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setInitialLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to load users");
      toast.error("Error loading users");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Form handlers
  const handleAddUserInputChange = (e) => {
    setNewUserData({ ...newUserData, [e.target.name]: e.target.value });
  };

  const handleAddUserRoleChange = (value) => {
    setNewUserData({ ...newUserData, role: value });
  };

  const handleAddNewUser = async (e) => {
    e.preventDefault();
    
    try {
      if (!newUserData.name || !newUserData.email || !newUserData.password || !newUserData.role) {
        toast.error("All fields are required");
        return;
      }

      setFormLoading(true);
      const response = await axios.post(
        `${API_URL}/users`,
        newUserData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers([...users, response.data]);
      setNewUserData({
        name: "",
        email: "",
        password: "",
        role: "stock_manager", // Reset to default
      });
      
      setIsAddUserModalOpen(false);
      toast.success("User created successfully!");
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUserClick = (userToEdit) => {
    setEditingUser({ ...userToEdit });
    setIsEditUserModalOpen(true);
  };

  const handleEditUserInputChange = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  const handleEditUserRoleChange = (value) => {
    setEditingUser({ ...editingUser, role: value });
  };

  const handleEditUserStatusChange = (value) => {
    setEditingUser({ ...editingUser, isActive: value === "true" });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      if (!editingUser.name || !editingUser.role) {
        toast.error("Name and role are required");
        return;
      }

      const updatePayload = {
        name: editingUser.name,
        role: editingUser.role,
        isActive: editingUser.isActive
      };

      setFormLoading(true);
      const response = await axios.put(
        `${API_URL}/users/${editingUser._id}`,
        updatePayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the user in the state
      setUsers(prevUsers => 
        prevUsers.map(u => u._id === editingUser._id ? response.data : u)
      );
      
      setIsEditUserModalOpen(false);
      setEditingUser(null);
      toast.success("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUserClick = (userToDelete) => {
    setDeletingUser(userToDelete);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    try {
      setFormLoading(true);
      await axios.delete(`${API_URL}/users/${deletingUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update local state to remove the deleted user
      setUsers(prevUsers => prevUsers.filter(u => u._id !== deletingUser._id));
      toast.success(`User ${deletingUser.name} deleted/deactivated successfully!`);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Error deleting user: " + err.message);
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeletingUser(null);
      setFormLoading(false);
    }
  };

  // Reset handlers
  const resetAddUserForm = () => {
    setNewUserData({
      name: "",
      email: "",
      password: "",
      role: "stock_manager", // Reset to default
    });
    setIsAddUserModalOpen(false);
  };

  const resetEditUserForm = () => {
    setEditingUser(null);
    setIsEditUserModalOpen(false);
  };

  const cancelDeleteUser = () => {
    setDeletingUser(null);
    setIsDeleteConfirmOpen(false);
  };

  if (initialLoading) {
    return (
      <div className="container flex flex-col justify-center items-center h-[70vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading user management data...</p>
      </div>
    );
  }

  return (
    <div className="container space-y-6 py-8">
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <UserManagementHeader onAddUser={() => setIsAddUserModalOpen(true)} />
        
        <Card>
          <CardContent className="p-0">
            <UserTable 
              users={users} 
              onEditUser={handleEditUserClick} 
              onDeleteUser={handleDeleteUserClick}
              isLoading={loading}
              error={error}
            />
          </CardContent>
        </Card>

        <DialogContent className="sm:max-w-[425px]">
          <AddUserForm 
            userData={newUserData}
            onInputChange={handleAddUserInputChange}
            onRoleChange={handleAddUserRoleChange}
            onSubmit={handleAddNewUser}
            onCancel={resetAddUserForm}
            userRoles={USER_ROLES}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      {editingUser && (
        <Dialog 
          open={isEditUserModalOpen} 
          onOpenChange={(isOpen) => { 
            setIsEditUserModalOpen(isOpen); 
            if (!isOpen) setEditingUser(null);
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <EditUserForm 
              userData={editingUser}
              onInputChange={handleEditUserInputChange}
              onRoleChange={handleEditUserRoleChange}
              onStatusChange={handleEditUserStatusChange}
              onSubmit={handleUpdateUser}
              onCancel={resetEditUserForm}
              userRoles={USER_ROLES}
              isLoading={formLoading}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Confirmation Dialog */}
      {deletingUser && (
        <AlertDialog 
          open={isDeleteConfirmOpen} 
          onOpenChange={(isOpen) => {
            setIsDeleteConfirmOpen(isOpen);
            if (!isOpen) setDeletingUser(null);
          }}
        >
          <DeleteUserDialog 
            user={deletingUser}
            onConfirm={handleConfirmDeleteUser}
            onCancel={cancelDeleteUser}
            isLoading={formLoading}
          />
        </AlertDialog>
      )}
    </div>
  );
} 