//indexer dependencies 
import { startStream, types } from 'near-lake-framework';

//socket dependencies   

import * as io from 'socket.io-client';

let socket;





//Event object definition
interface EventLogData {
  standard: string,
  version: string,
  event: string,
  data?: unknown,
};


//near lake indexer
//1- configuration
//2- main running function



//1-configuration
const lakeConfig: types.LakeConfig = {
  s3BucketName: "near-lake-data-testnet",
  s3RegionName: "eu-central-1",
  startBlockHeight: 114004480
};

//2- main running function
async function handleStreamerMessage(
  streamerMessage: types.StreamerMessage
): Promise<void> {

  console.log("************************************************************************************************");
  console.log("Analyzing block");
  console.log(
    `Block #${streamerMessage.block.header.height} Shards: ${streamerMessage.shards.length}`
  );
  console.log("************************************************************************************************");

  //each streamerMessage has multiple shards(up to 4)
  //each shard has an array receiptExecutionOutcomes
  //we're making an array of all receiptExecutionOutcomes
  let listOfReceiptExecutionOutcomes = streamerMessage.shards.flatMap(shard => shard.receiptExecutionOutcomes);

  //how many execution outcomes are per block 
  console.log("this block has " + listOfReceiptExecutionOutcomes.length + " execution outcomes");

  //each executionOutcome has a property called outcome
  //each outcome has logs where we find emmitetd events from the blockchain 

  let a = listOfReceiptExecutionOutcomes.map(outcome => ({
    receipt: {
      id: outcome.receipt.receiptId,
      receiverId: outcome.receipt.receiverId,
    },
    events: outcome.executionOutcome.outcome.logs.map(
      (log: string): EventLogData => {
        const [_, probablyEvent] = log.match(/^EVENT_JSON:(.*)$/) ?? []
        //const [_, probablyEvent] = log.match(/^EVENT_JSON:{"standard":"nep141","version":"1.0.0","event":"ft_mint"(.*)$/) ?? []

        try {
          // console.log(_);
          //console.log(probablyEvent);

          // console.log(JSON.parse(probablyEvent));

          return JSON.parse(probablyEvent)
        } catch (e) {
          return
        }
      }
    )
      .filter(event => event !== undefined)
  }))

  let events = a.flatMap(outcome => outcome.events)
  //console.log(events);
  events.forEach(event => {
    console.log(event);
    socket.emit('message', event);

  });

}

(async () => {
  socket = io.connect('http://localhost:3000');
  console.log("connected");
  await startStream(lakeConfig, handleStreamerMessage);
})();

