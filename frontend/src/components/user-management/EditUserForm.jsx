import React from "react";
import { Button } from "../ui/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2 } from "lucide-react";

export function EditUserForm({ 
  userData, 
  onInputChange, 
  onRoleChange, 
  onStatusChange,
  onSubmit, 
  onCancel,
  userRoles,
  isLoading
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit User: {userData.name}</DialogTitle>
        <DialogDescription>
          Update user details. Email cannot be changed here.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="edit-name" className="text-right">
            Name
          </Label>
          <Input
            id="edit-name"
            name="name"
            value={userData.name}
            onChange={onInputChange}
            className="col-span-3"
            required
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="edit-email" className="text-right">
            Email
          </Label>
          <Input
            id="edit-email"
            name="email"
            type="email"
            value={userData.email}
            className="col-span-3"
            readOnly
            disabled
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="edit-role" className="text-right">
            Role
          </Label>
          <Select 
            name="role" 
            value={userData.role} 
            onValueChange={onRoleChange}
            disabled={isLoading}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {userRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="edit-isActive" className="text-right">
            Status
          </Label>
          <Select
            name="isActive"
            value={String(userData.isActive)}
            onValueChange={onStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
} 