//indexer dependencies
import { startStream, types } from 'near-lake-framework';


//socket dependencies

interface EventLogData {
standard: string,
version: string,
event: string,
data?: unknown,
};

const lakeConfig: types.LakeConfig = {
s3BucketName: "near-lake-data-testnet",
s3RegionName: "eu-central-1",
startBlockHeight: 113587351,
};

async function handleStreamerMessage(
streamerMessage: types.StreamerMessage
): Promise<void> {

let listOfReceiptExecutionOutcomes = streamerMessage.shards.flatMap(shard => shard.receiptExecutionOutcomes);
console.log("********************");

console.log(listOfReceiptExecutionOutcomes.length);
/* listOfReceiptExecutionOutcomes.forEach(r => {
try {
console.log(r.executionOutcome.outcome.logs);

} catch (error) {

}

});
*/
let outcome = listOfReceiptExecutionOutcomes.map(outcome => ({
receipt: {
id: outcome.receipt.receiptId,
receiverId: outcome.receipt.receiverId,
},
events: outcome.executionOutcome.outcome.logs.map(
(log: string): EventLogData => {
const [_, probablyEvent] = log.match(/^EVENT_JSON:(.*)$/) ?? []
try {
console.log(JSON.parse(probablyEvent));

return JSON.parse(probablyEvent)
} catch (e) {
return
}
}
)
.filter(event => event !== undefined)
}))
.filter(relevantOutcome =>
  relevantOutcome.events.some(
    event => event.event === "ft_mint"
  )
);
outcome.forEach(element => {
  element.events.forEach(element => {
    console.log(JSON.stringify(element))
    
  });
  
});




}

(async () => {
await startStream(lakeConfig, handleStreamerMessage);
})();