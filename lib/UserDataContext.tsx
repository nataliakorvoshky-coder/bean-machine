"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface UserDataType {
users: any[]
refreshUsers: () => Promise<void>
}

const UserDataContext = createContext<UserDataType>({
users: [],
refreshUsers: async () => {}
})

export function UserDataProvider({ children }: { children: React.ReactNode }) {

const [users, setUsers] = useState<any[]>([])

async function refreshUsers() {

```
try {

  const res = await fetch("/api/admin/list-users")

  if (!res.ok) throw new Error("Failed to load users")

  const data = await res.json()

  setUsers(data.users || [])

} catch (err) {

  console.error("User load failed", err)

  setUsers([])

}
```

}

useEffect(() => {

```
refreshUsers()
```

}, [])

return (
<UserDataContext.Provider value={{ users, refreshUsers }}>
{children}
</UserDataContext.Provider>
)
}

export function useUserData() {
return useContext(UserDataContext)
}
