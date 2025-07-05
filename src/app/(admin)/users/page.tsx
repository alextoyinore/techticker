'use client';

import { MoreHorizontal, PlusCircle, LoaderCircle } from "lucide-react"
import { useEffect, useState, useCallback, useTransition } from "react";
import { collection, getDocs, query, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { createUser } from "@/app/actions/user-actions";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    joined: string;
    avatar: string;
    fallback: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const [isPending, startTransition] = useTransition();

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    
    // Add User form state
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserRole, setNewUserRole] = useState("writer");
    
    const [newRole, setNewRole] = useState("");

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const usersCollection = collection(db, "users");
        const q = query(usersCollection);
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.displayName || 'N/A',
                email: data.email,
                role: data.role,
                joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A',
                avatar: data.photoURL || '',
                fallback: (data.displayName || data.email).charAt(0).toUpperCase(),
            }
        }) as User[];
        setUsers(usersData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEditRoleClick = (user: User) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsEditRoleDialogOpen(true);
    };

    const handleDeleteUserClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteUserDialogOpen(true);
    };
    
    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;
        try {
            const userRef = doc(db, "users", selectedUser.id);
            await updateDoc(userRef, { role: newRole });
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
            toast({ title: 'Success', description: `User role updated to ${newRole}.` });
        } catch (error) {
            console.error("Error updating role:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update user role.' });
        } finally {
            setIsEditRoleDialogOpen(false);
            setSelectedUser(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await deleteDoc(doc(db, "users", selectedUser.id));
            setUsers(users.filter(u => u.id !== selectedUser.id));
            toast({ title: 'Success', description: 'User removed from the list.' });
        } catch (error) {
            console.error("Error deleting user document:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not remove user.' });
        } finally {
            setIsDeleteUserDialogOpen(false);
            setSelectedUser(null);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }

        startTransition(async () => {
            try {
                const authToken = await currentUser.getIdToken();
                const result = await createUser({
                    displayName: newUserName,
                    email: newUserEmail,
                    password: newUserPassword,
                    role: newUserRole,
                    authToken
                });

                if (result.error) {
                    toast({ variant: 'destructive', title: 'Error', description: result.error });
                } else {
                    toast({ title: 'Success', description: 'User created successfully.' });
                    setIsAddUserDialogOpen(false);
                    // Reset form
                    setNewUserName("");
                    setNewUserEmail("");
                    setNewUserPassword("");
                    setNewUserRole("writer");
                    fetchUsers();
                }
            } catch (error) {
                console.error("Error creating user:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
            }
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role?.toLowerCase()) {
            case "superadmin":
            case "admin":
                return "default";
            case "editor":
                return "secondary";
            case "writer":
            case "user":
                return "outline";
            default:
                return "outline";
        }
    }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Users</CardTitle>
                <CardDescription>Manage your team and their roles.</CardDescription>
            </div>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="gap-1" disabled={currentUser?.role !== 'superadmin'}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add User
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <form onSubmit={handleAddUser}>
                        <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user and assign them a role. They will be able to change their password later.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Ada Lovelace" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="ada@example.com" className="col-span-3" required />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">Password</Label>
                                <Input id="password" type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">Role</Label>
                                <Select value={newUserRole} onValueChange={setNewUserRole}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="writer">Writer</SelectItem>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="superadmin">Superadmin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? <LoaderCircle className="animate-spin" /> : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Joined Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="grid gap-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                ))
            ) : (
                users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.fallback}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-0.5">
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                    <Badge variant={getRoleBadge(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.joined}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={currentUser?.role !== 'superadmin' || currentUser?.id === user.id}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleEditRoleClick(user)}>
                                Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteUserClick(user)}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit User Role</DialogTitle>
                <DialogDescription>Change the role for {selectedUser?.name}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="writer">Writer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">Superadmin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditRoleDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateRole}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will remove the user record for &quot;{selectedUser?.name}&quot; from the CMS. 
                    This action does not delete their authentication account and cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                    Yes, remove user record
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
