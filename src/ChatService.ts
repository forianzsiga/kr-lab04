export type MessageDto = {
	id: number;
	timeStamp: string;
	referenceTo: number; // 0: normal message, +: update, -: delete
	senderId: string;
	contentType: number;
	content: string;
}
export type UserDto = {
	id: string;
	displayName: string;
	tag: string;
	lastSeen: string;
}
export type ConversationDto = {
	channelId: string;
	parentChannelId: string;
	name: string;
	description: string;
	data: string;
	state: number; // disconnected, outgoingRequest, incomingRequest, accepted, group
	access: number; // none, read, write, admin
	notificationLevel: number; // none, gray, push
	unreadCount: number;
	memberIds: string[];
	lastMessages: MessageDto[];
}
export type InboxDto = {
	user: UserDto;
	contacts: UserDto[];
	conversations: ConversationDto[];
}
export type OutgoingPacket =
	{ type: "login", email: string, password: string, staySignedIn: boolean } |
	{ type: "loginWithToken", token: string } |
	{ type: "register", email: string, password: string, displayName: string, staySignedIn: boolean } |
	{ type: "contactRequest", email: string, firstMessage: string } |
	{ type: "message", channelId: string, referenceTo: number, contentType: number, content: string };
export type IncomingPacket =
	{ type: "error", message: string } |
	{ type: "login", query: string, token: string, inbox: InboxDto } |
	{ type: "message", channelId: string, message: MessageDto } |
	{ type: "conversationAdded", conversation: ConversationDto } |
	{ type: "conversationRemoved", channelId: string } |
	{ type: "user", user: UserDto };

class ChatService
{
	#ws = new WebSocket( "wss://kliensoldali.azurewebsites.net/" );
	inbox?: InboxDto;
	#listeners: ( () => void )[] = [];
	constructor()
	{
		this.#ws.addEventListener( "error", () => alert( "WebSocket hiba, zárd be a felesleges tabokat, és frissítsd az oldalt." ) );
		this.#ws.addEventListener( "message", e =>
		{
			let p = JSON.parse( e.data ) as IncomingPacket;
			console.log( p ); // DEBUG
			switch ( p.type )
			{
				case "error":
					alert( p.message );
					break;
				case "login":
					this.inbox = p.inbox;
					break;
				case "message":
					let cid = p.channelId;
					this.inbox!.conversations.find( x => x.channelId === cid )?.lastMessages.push( p.message );
					break;
				case "conversationAdded":
					this.inbox!.conversations.push( p.conversation );
					break;
			}
			for ( let listener of this.#listeners )
				listener();
		} );

	}
	send( packet: OutgoingPacket )
	{
		this.#ws.send( JSON.stringify( packet ) );
	}
	addListener( listener: () => void )
	{
		this.#listeners = [ ...this.#listeners, listener ];
	}

	removeListener( listener: () => void )
	{
		this.#listeners = this.#listeners.filter( x => x !== listener );
	}

}
export const chatService = new ChatService();
