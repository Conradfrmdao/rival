import { NextRequest, NextResponse } from 'next/server';
import { Server as NetServer } from 'net';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SocketServerInterface {
  io: ServerIO | null;
}

const SocketServer: SocketServerInterface = {
  io: null
};

const resMap = new WeakMap<NextApiResponse, { socket: any; }>();

export async function GET() {
  if (!SocketServer.io) {
    console.log('Socket.IO server already running or will be initialized separately');
  }

  return Response.json({ message: 'Socket.IO endpoint available' });
}