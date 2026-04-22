// WebSocket service for real-time communication

import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'wss://healthmarketarena.com';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.handleReconnect(token);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect(token);
    });
  }

  private handleReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      this.connect(token);
    }, delay);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Provider availability
  setAvailability(available: boolean): void {
    this.socket?.emit('provider:available', { available });
  }

  // Booking actions
  acceptBooking(bookingId: string): void {
    this.socket?.emit('booking:accept', { bookingId });
  }

  declineBooking(bookingId: string): void {
    this.socket?.emit('booking:decline', { bookingId });
  }

  updateBookingStatus(bookingId: string, status: string): void {
    this.socket?.emit('booking:status-update', { bookingId, status });
  }

  // Location updates
  updateLocation(coordinates: [number, number]): void {
    this.socket?.emit('location:update', { coordinates });
  }

  // Event listeners
  onNewBooking(callback: (booking: any) => void): void {
    this.socket?.on('booking:new', callback);
  }

  onBookingCancelled(callback: (data: any) => void): void {
    this.socket?.on('booking:cancelled', callback);
  }

  onBookingTimeout(callback: (data: any) => void): void {
    this.socket?.on('booking:timeout', callback);
  }

  onNewNotification(callback: (notification: any) => void): void {
    this.socket?.on('notification:new', callback);
  }

  onProviderStatusChanged(callback: (data: any) => void): void {
    this.socket?.on('provider:status-changed', callback);
  }

  // Remove event listeners
  offNewBooking(callback: (booking: any) => void): void {
    this.socket?.off('booking:new', callback);
  }

  offBookingCancelled(callback: (data: any) => void): void {
    this.socket?.off('booking:cancelled', callback);
  }

  offBookingTimeout(callback: (data: any) => void): void {
    this.socket?.off('booking:timeout', callback);
  }

  offNewNotification(callback: (notification: any) => void): void {
    this.socket?.off('notification:new', callback);
  }

  offProviderStatusChanged(callback: (data: any) => void): void {
    this.socket?.off('provider:status-changed', callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();
