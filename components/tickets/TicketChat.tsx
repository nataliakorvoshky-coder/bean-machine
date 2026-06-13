"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  supabase,
} from "@/lib/supabase";

import {
  updateTicketView
} from "@/lib/tickets/updateTicketView";

import AdjustmentRequestCard
  from "@/components/tickets/AdjustmentRequestCard";

interface Props {

  ticketId: string;

  requestType: string;

  senderRole:
    "employee" |
    "manager";

  senderName: string;

  tableName: string;

  onTicketUpdated?: () => void;
}

export default function TicketChat({

  ticketId,

  requestType,

  senderRole,

  senderName,

  tableName,

  onTicketUpdated,

}: Props) {

  const [messages, setMessages] =
    useState<any[]>([]);

const didInitialScrollRef =
  useRef(false);

  const [newMessage, setNewMessage] =
    useState("");

  const [editingMessageId, setEditingMessageId] =
    useState<string | null>(null);

  const [editText, setEditText] =
    useState("");

  const [openReactionId, setOpenReactionId] =
    useState<string | null>(null);


  const [typingUsers, setTypingUsers] =
    useState<any[]>([]);

  const [currentUser, setCurrentUser] =
    useState<any>(null);

    const [
  currentEmployeeName,

  setCurrentEmployeeName
] = useState("");

const chatRef =
  useRef<HTMLDivElement>(null);

  const channelRef =
    useRef<any>(null);

  const reactionPopupRef =
    useRef<HTMLDivElement>(null);

    const fileInputRef =
  useRef<HTMLInputElement>(null);

    const messagesEndRef =
  useRef<HTMLDivElement>(null);

  const [uploading, setUploading] =
  useState(false);

const [attachments, setAttachments] =
  useState<any[]>([]);

  const [

  ticketStatus,

  setTicketStatus

] = useState("");

const [

  isAdmin,

  setIsAdmin

] = useState(false);

useEffect(()=>{

  async function loadUser() {

    const {
      data
    } = await supabase.auth
      .getUser();

    const user =
      data.user;

    setCurrentUser(user);

    if (!user)
      return;

    const {
      data: profile
    } = await supabase

      .from("profiles")

      .select(`
  employee_id,
  role_id
`)

      .eq("id", user.id)

      .maybeSingle();

    if (!profile?.employee_id)
      return;

    const {
      data: employee
    } = await supabase

      .from("employees")

      .select("name")

      .eq(
        "id",
        profile.employee_id
      )

      .maybeSingle();

    if (employee?.name) {

      setCurrentEmployeeName(
        employee.name
      );
    }

    /*
  GET TICKET STATUS
*/

const {
  data: ticket
} = await supabase

  .from(tableName)

  .select(`
    status
  `)

  .eq(
    "id",
    ticketId
  )

  .maybeSingle();

if (ticket?.status) {

  setTicketStatus(
    ticket.status
  );
}

/*
  GET ROLE
*/

const {
  data: role
} = await supabase

  .from("roles")

  .select(`
    name,
    level
  `)

  .eq(
    "id",
    profile.role_id
  )

  .maybeSingle();

/*
  ADMIN CHECK
*/

if (

  role?.name ===
    "admin"

  ||

  role?.level >= 4

) {

  setIsAdmin(true);
}
  }

  loadUser();

}, []);


useEffect(() => {

  if (
    !ticketId ||
    !tableName
  ) {
    return;
  }

  /*
    INITIAL VIEW
  */

  updateTicketView(
    tableName,
    ticketId
  );

/*
  LOAD MESSAGES
*/

(async ()=>{

  await loadMessages();

  requestAnimationFrame(()=>{

    requestAnimationFrame(()=>{

      scrollToBottom();

    });

  });

})();

  /*
    REALTIME
  */

  const channel =
    supabase.channel(
      `ticket-${ticketId}`
    );

  channelRef.current =
    channel;

  channel

.on(

  "postgres_changes",

  {

    event: "*",

    schema: "public",

    table:
      "loa_adjustment_requests",

    filter:
      `loa_request_id=eq.${ticketId}`,
  },

(payload)=>{

  loadMessages();

  if (
    payload.eventType ===
    "INSERT"
  ) {

    scrollToBottom();
  }
}
)

channel

  .on(

    "postgres_changes",

    {

      event: "*",

      schema: "public",

      table:
        "request_comments",

      filter:
        `request_id=eq.${ticketId}`,
    },

(payload)=>{

  console.log(
    "REQUEST COMMENT REALTIME",
    payload
  );

  loadMessages();

  if (
    payload.eventType ===
    "INSERT"
  ) {

    scrollToBottom();
  }
}
  )

  .on(

    "postgres_changes",

    {

      event: "*",

      schema: "public",

      table:
        "request_events",

      filter:
        `request_id=eq.${ticketId}`,
    },

(payload)=>{

  loadMessages();

  if (
    payload.eventType ===
    "INSERT"
  ) {

    scrollToBottom();
  }
}
  )

  channel

.on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
  },
  (payload) => {

    console.log(
      "ANY DATABASE EVENT",
      payload
    );

  }
)

 .subscribe((status)=>{

  console.log(
    "Realtime status:",
    status
  );

});

  /*
    CLEANUP
  */

  return ()=>{

    supabase.removeChannel(
      channel
    );
  };

}, [
  ticketId,
  tableName
]);

useEffect(() => {

  const handleRefresh = () => {

    loadMessages();
  };

  window.addEventListener(
    "refresh-ticket-chat",
    handleRefresh
  );

  return () => {

    window.removeEventListener(
      "refresh-ticket-chat",
      handleRefresh
    );
  };

}, []);


  useEffect(()=>{

function handleClickOutside(
  event: MouseEvent
) {

  if (

    reactionPopupRef.current &&

    !reactionPopupRef.current.contains(
      event.target as Node
    )
  ) {

    setOpenReactionId(null);
  }
}
    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return ()=>{

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

async function loadMessages() {

  /*
    COMMENTS
  */

  const {

    data: comments,

  } = await supabase

    .from(
      "request_comments"
    )

    .select("*")

    .eq(
      "request_id",
      ticketId
    )

    .order(
      "created_at",
      {
        ascending: true,
      }
    );

/*
  ADJUSTMENT REQUESTS
*/

const {

  data: adjustments,

} = await supabase

  .from(
    "loa_adjustment_requests"
  )

  .select("*")

  .eq(
    "loa_request_id",
    ticketId
  )

  .order(
    "created_at",
    {
      ascending: true,
    }
  );

  /*
    MERGE
  */

const combined = [

  ...(comments || []).map(
    (c:any)=>({

      ...c,

      itemType:
        "comment",
    })
  ),

  ...(adjustments || []).map(
    (a:any)=>({

      ...a,

      itemType:
        "adjustment",
    })
  ),
]

.sort((a:any,b:any)=>{

  const timeDiff =

    new Date(a.created_at)
      .getTime()

    -

    new Date(b.created_at)
      .getTime();

  /*
    SAME TIMESTAMP

    COMMENTS FIRST
    ADJUSTMENT CARD SECOND
  */

  if (

    Math.abs(timeDiff) < 3000

  ) {

    if (

      a.itemType === "comment" &&

      b.itemType === "adjustment"

    ) {

      return -1;
    }

    if (

      a.itemType === "adjustment" &&

      b.itemType === "comment"

    ) {

      return 1;
    }
  }

  return timeDiff;
});

  setMessages(combined);
}

function scrollToBottom() {

  setTimeout(()=>{

    if (!chatRef.current)
      return;

    chatRef.current.scrollTo({

      top:
        chatRef.current.scrollHeight,

      behavior:
        "smooth",
    });

  }, 50);
}
  async function sendMessage() {

if (

  !newMessage.trim() &&

  attachments.length === 0
) {

  return;
}

    const {
      data: auth,
    } = await supabase
      .auth
      .getUser();

    const user =
      auth?.user;

    if (!user)
      return;

    console.log(
  "SENDING ATTACHMENTS",
  attachments
);

    const response =
      await fetch(

        "/api/tickets/chat/send",

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            ticket_id:
              ticketId,

            request_type:
              requestType,

            user_id:
              user.id,

sender_name:

  currentEmployeeName ||

  senderName ||

  currentUser?.user_metadata
    ?.full_name

  ||

  currentUser?.user_metadata
    ?.username

  ||

  "Unknown",

            sender_role:
              senderRole,

            message:
              newMessage,

attachments:
  attachments,

          }),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {

      console.error(result);

      return;
    }

    setMessages((prev)=>[
      ...prev,
      result.message,
    ]);

    setNewMessage("");

    setAttachments([]);

    if (fileInputRef.current) {

  fileInputRef.current.value = "";
}

    scrollToBottom();
  }

  async function uploadFile(
  file: File
) {

  try {

    setUploading(true);

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await fetch(

        "/api/tickets/upload",

        {

          method: "POST",

          body: formData,
        }
      );

    const result =
      await response.json();

    if (!response.ok) {

      console.error(result);

      return;
    }

    setAttachments((prev)=>[
      ...prev,
      result,
    ]);

  } catch (err) {

    console.error(err);

  } finally {

    setUploading(false);
  }
}

  async function saveEdit(
    messageId: string
  ) {

    const response =
      await fetch(

        "/api/tickets/chat/edit",

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            message_id:
              messageId,

            user_id:
              currentUser.id,

            message:
              editText,
          }),
        }
      );

    if (!response.ok)
      return;

    setEditingMessageId(null);

    setEditText("");

    loadMessages();
  }

const isLocked =

  ticketStatus
    ?.toLowerCase()

    ===

  "completed"

  &&

  !isAdmin;

  return (

    <div
      className="
        bg-white

        border
        border-emerald-100

        rounded-2xl

        shadow-sm
      "
    >

      {/* HEADER */}

      <div
        className="
          px-6
          py-4

          border-b
          border-emerald-100
        "
      >

        <div
          className="
            text-lg
            font-bold
            text-emerald-700
          "
        >
          Ticket Chat
        </div>

      </div>

      {/* MESSAGES */}

<div

  ref={chatRef}

  className="
    h-[550px]

overflow-y-auto
overflow-x-visible

relative

pb-40

          scrollbar-hide

          px-6
          py-5

          bg-emerald-50/30

          space-y-4
        "
      >

        {messages.map((msg)=>{

if (
  msg.itemType ===
  "adjustment"
) {

  if (
    senderRole !== "manager"
  ) {
    return null;
  }

  return (

    <AdjustmentRequestCard
      key={msg.id}
      adjustment={msg}
      onUpdated={async () => {

        await loadMessages();

        await onTicketUpdated?.();

      }}
    />
  );
}

          const isEmployee =
            msg.sender_role ===
            "employee";

          return (

            <div

              key={msg.id}

              className={`
                flex
                flex-col

                ${
                  isEmployee
                    ? "items-end"
                    : "items-start"
                }
              `}
            >
              <div
                className="
                  max-w-[85%]

                  relative
                "
              >

                {/* HEADER */}

<div
  className="
    flex
    items-center

    gap-4

    mt-1

    leading-none
  "
>

                  <div
                    className="
                      text-sm
                      font-semibold
                      text-emerald-700
                    "
                  >
                    {msg.sender_name}
                  </div>

                  <div
                    className="
                      text-[11px]
                      text-emerald-500
                    "
                  >
                    {new Date(
                      msg.created_at
                    ).toLocaleString()}
                  </div>

                </div>

                {/* MESSAGE */}

                <div
                  className="
                    bg-white

                    border
                    border-emerald-100

                    rounded-2xl

                    px-4
                    py-3

                    text-sm
                    text-emerald-800

                    shadow-sm
                  "
                >

{editingMessageId === msg.id ? (

<textarea

  value={editText}

  onChange={(e)=>
    setEditText(
      e.target.value
    )
  }

  onKeyDown={(e)=>{

    if (

      e.key === "Enter" &&

      !e.shiftKey

    ) {

      e.preventDefault();

      saveEdit(
        msg.id
      );
    }
  }}

  className="
    w-full

    border
    border-emerald-200

    rounded-xl

    p-2

    text-sm

    focus:outline-none
  "
/>

) : (

  <>

    <div>

      {msg.message || (

        <span
          className="
            italic
            text-emerald-400
          "
        >
          Attachment
        </span>

      )}

    </div>

    {msg.attachments?.length > 0 && (

      <div
        className="
          flex
          flex-wrap
          gap-2

          mt-3
        "
      >

        {msg.attachments.map(
          (file: any)=>{

const isImage =
  file.type === "image";

const isVideo =
  file.type === "video";

            return (

              <div key={file.url}>

                {isImage ? (

                  <a
                    href={file.url}
                    target="_blank"
                  >

                    <img

                      src={file.url}

                      alt="attachment"

                      className="
                        max-w-[260px]
                        max-h-[260px]

                        rounded-2xl

                        border
                        border-emerald-100

                        shadow-sm
                      "
                    />

                  </a>

                ) : isVideo ? (

<video

  key={file.url}

  src={file.url}

  controls

  controlsList="nodownload"

  playsInline

  preload="auto"

  className="
    block

    w-full
    max-w-[420px]

    rounded-2xl

    border
    border-emerald-100

    shadow-sm

    bg-gray-100

    cursor-pointer
  "

  onDoubleClick={(e)=>{

    const video =
      e.currentTarget;

    if (
      video.requestFullscreen
    ) {

      video.requestFullscreen();
    }
  }}

  onLoadedData={()=>
    console.log(
      "VIDEO LOADED",
      file.url
    )
  }

  onError={(e)=>
    console.error(
      "VIDEO ERROR",
      e
    )
  }
/>

                ) : (

                  <a

                    href={file.url}

                    target="_blank"

                    className="
                      flex
                      items-center
                      gap-2

                      px-3
                      py-2

                      rounded-xl

                      bg-emerald-50

                      border
                      border-emerald-100

                      text-xs
                      text-emerald-700
                    "
                  >

                    📎

{file.original_name || "Attachment"}

                  </a>

                )}

              </div>

            );
          }
        )}

      </div>

    )}

  </>

)}

</div>

{/* REACTIONS */}

{msg.reactions?.length > 0 && (

  <div
    className="
      flex
      flex-wrap
      gap-2

      mt-2
    "
  >

    {Object.entries(

      (msg.reactions || []).reduce(

        (acc: any, r: any) => {

          if (!acc[r.emoji]) {

            acc[r.emoji] = [];
          }

          acc[r.emoji].push(r);

          return acc;

        },

        {}
      )
    ).map(([emoji, reacts]: any)=>(

      <button

        key={emoji}

        onClick={async ()=>{

          const response =
            await fetch(

              "/api/tickets/reactions/toggle",

              {

                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({

                  message_id:
                    msg.id,

                  user_id:
                    currentUser.id,

                  emoji,
                }),
              }
            );

          if (response.ok) {

            await loadMessages();
          }
        }}

        className="
          px-2
          py-1

          rounded-full

          border
          border-emerald-200

          bg-white

          text-xs

          hover:bg-emerald-50

          transition-all
        "
      >

        {emoji}
        {" "}
        {reacts.length}

      </button>

    ))}

  </div>

)}

                {/* ACTIONS */}

                {msg.sender_id === currentUser?.id

  &&

  !isLocked

  && (

                  <div
className="
  flex
  items-center

  gap-1

  text-[11px]

  text-emerald-500

  hover:text-emerald-700
"
                  >

                    <button

                      onClick={()=>{

                        setEditingMessageId(
                          msg.id
                        );

                        setEditText(
                          msg.message
                        );
                      }}

                      className="
                        text-[10px]

                        text-emerald-500
                      "
                    >
                      ✏️ Edit
                    </button>


                    {/* REACTIONS */}

                    <div
className="
  flex
  items-center

  gap-1

  text-[11px]

  text-emerald-500

  hover:text-emerald-700
"
                    >

                      <button

                        onClick={()=>{

                          setOpenReactionId(

                            openReactionId === msg.id
                              ? null
                              : msg.id
                          );
                        }}

                        className="
                          text-[10px]

                          text-emerald-500
                        "
                      >
                        😊 React
                      </button>

                      {openReactionId === msg.id && (

                        <div

                          ref={reactionPopupRef}


className={`
  absolute

  top-full

  ${
    isEmployee
      ? "right-0"
      : "left-0"
  }

  mt-2

  z-[999999]

  bg-white

  border
  border-emerald-100

  rounded-2xl

  shadow-2xl

  p-3

  grid
  grid-cols-8

  gap-1.5

  w-[460px]

  backdrop-blur-sm
`}
                        >

                          {[
  "👍",
  "👎",
  "❤️",
  "🔥",
  "😂",
  "🤣",
  "😮",
  "😢",
  "😭",
  "😡",
  "🤔",
  "👀",
  "🎉",
  "✨",
  "🚀",
  "🙏",
  "💀",
  "😎",
  "🤯",
  "🥳",
  "😅",
  "🤝",
  "💯",
  "⚠️",
  "✅",
  "❌",
  "📌",
  "👏",
  "🙌",
  "🤡",
  "😴",
  "🥐",
  "🧁",
  "🥣",

  "☕",
  "🍵",
  "🧋",
  "🥤",
  "🐼",

  "🍿",
  "🍪",
  "🍩",
  "🫡",
  "💜",
]
                          .map((emoji)=>(
<button

  key={emoji}

  className="
h-9
w-9


    rounded-xl

    text-lg

    hover:bg-emerald-50
    hover:scale-110

    transition-all

    flex
    items-center
    justify-center
  "

onClick={async ()=>{

  const response =
    await fetch(

      "/api/tickets/reactions/toggle",

      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          message_id:
            msg.id,

          user_id:
            currentUser.id,

          emoji,
        }),
      }
    );

  const result =
    await response.json();

  if (!response.ok) {

    console.error(result);

    return;
  }

  await loadMessages();

  setOpenReactionId(null);
}}
                            >
                              {emoji}
                            </button>

                          ))}

                        </div>

                      )}

                    </div>

                  </div>

                )}

              </div>

            </div>

          );

        })}

        <div ref={messagesEndRef} />

      </div>

      {isLocked && (

  <div
    className="
      mx-6
      mb-4

      rounded-2xl

      border
      border-amber-200

      bg-amber-50

      px-4
      py-3

      text-sm
      text-amber-700
    "
  >

    This ticket has been
    completed.

    Chat is locked unless
    reopened by an admin.

  </div>

)}

      {/* INPUT */}

      <div
        className="
          border-t
          border-emerald-100

          p-4
        "
      >

 <div
  className="
    flex
    items-end
    gap-2
  "
>

            {/* ATTACHMENTS PREVIEW */}

{attachments.length > 0 && (

  <div
    className="
      flex
      flex-wrap
      gap-2

      mb-3
    "
  >

{attachments.map((file, index)=>(

  <div

    key={file.url}

    className="
      flex
      items-center

      gap-2

      px-3
      py-1

      rounded-full

      bg-emerald-100

      text-xs
      text-emerald-700
    "
  >

    <a

      href={file.url}

      target="_blank"

      className="
        hover:underline
      "
    >

{file.original_name || "Attachment"}

    </a>

    <button

      onClick={()=>{

        setAttachments(

          attachments.filter(
            (_: any, i: number)=>
              i !== index
          )
        );
      }}

      className="
        text-red-500

        hover:text-red-700

        text-[10px]

        font-bold
      "
    >

      ✕
      
    </button>

  </div>

))}

  </div>

)}

<button

  type="button"
  disabled={isLocked}

  onClick={()=>
    fileInputRef.current?.click()
  }

  className="
    h-[54px]
    w-[54px]

    shrink-0

    rounded-xl

    border
    border-emerald-200

    bg-white

    hover:bg-emerald-50

    flex
    items-center
    justify-center

    text-3xl
hover:rotate-6

    transition-all
  "
>

  🐼

</button>

<input

  ref={fileInputRef}
  disabled={isLocked}

  type="file"

  multiple

  className="hidden"

  onChange={(e)=>{

  const files =
    Array.from(
      e.target.files || []
    );

const allowed = [

  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",

  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
  "video/x-msvideo",
  "video/mpeg",
];

  files.forEach((file)=>{

    if (

      !allowed.includes(
        file.type
      )
    ) {

      alert(
        `${file.name} is unsupported.\n\nUse MP4 or WEBM videos.`
      );

      return;
    }

    uploadFile(file);
  });
}}

/>

          <textarea

            value={newMessage}
            disabled={isLocked}

            onChange={(e)=>
              setNewMessage(
                e.target.value
              )
            }

            rows={3}

placeholder="Type a message..."

className="
  flex-1

  border
  border-emerald-200

  rounded-xl

  px-4
  py-3

  resize-none

  focus:outline-none
  focus:ring-2
  focus:ring-emerald-300
  focus:border-emerald-400
"
          />

<button

  onClick={sendMessage}

  disabled={
    isLocked ||
    uploading
  }

            className="
              px-5
              py-3

              bg-emerald-600
              hover:bg-emerald-700

              text-white

              rounded-xl

              disabled:opacity-50
disabled:cursor-not-allowed
            "
          >
            Send
          </button>

        </div>

      </div>

       </div>

  );
}