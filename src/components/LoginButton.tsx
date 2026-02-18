"use client";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {session.user?.image && (
            <Image
                src={session.user.image} 
                alt="User Avatar" 
                width={32}
                height={32}
                style={{ borderRadius: '50%' }} 
            />
        )}
        <span>Hola, {session.user?.name}</span>
        <button onClick={() => signOut()} style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc', background: 'transparent', borderRadius: '4px' }}>
          Cerrar sesión
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => signIn("google")} style={{ padding: '8px 16px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
      Iniciar sesión con Google
    </button>
  );
}
