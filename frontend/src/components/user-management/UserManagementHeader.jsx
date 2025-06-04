import React from "react";
import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";
import { PlusIcon } from "../../utils/LucideIcons";

export function UserManagementHeader({ onAddUser }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and their permissions
        </p>
      </div>
      <DialogTrigger asChild>
        <Button onClick={onAddUser} size="sm" className="gap-1">
          <PlusIcon className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </DialogTrigger>
    </div>
  );
} 