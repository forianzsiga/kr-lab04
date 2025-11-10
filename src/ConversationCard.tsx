import { ConversationDto } from "./ChatService";
import "./ConversationCard.css"

export function ConversationCard( { conversation, selected, onSelect }: {
	conversation: ConversationDto,
	selected: boolean,
	onSelect: () => void
} )
{
	let lastMessage = conversation.lastMessages.length > 0 ?
		conversation.lastMessages[ conversation.lastMessages.length - 1 ] : null;
	let time = lastMessage && new Date( lastMessage.timeStamp ).toLocaleTimeString();

	return <div class={ "ConversationCard" + ( selected ? " selected" : "" ) }
		onClick={ () => onSelect() }>
		<div>
			<h3>{ conversation.name }</h3>
			<time datetime={ time }>{ time }</time>
		</div>
		<span>{ lastMessage?.content }</span>
	</div>
}
