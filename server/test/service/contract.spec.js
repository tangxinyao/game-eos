const EOS = require("eosjs");

async function test() {
  try {
    const eos = EOS({
      keyProvider: "5JYrjJ25Sx8vdkecyYU8XRsDJQEiV23KP8qBLniRFGphSCYq1VL",
      httpEndpoint: "http://127.0.0.1:7777"
    });

    // transfer
    const result_1 = await eos.transfer('alice', 'bob', '1.0000 SYS', '', {
      authorization: 'alice@active',
      broadcast: true,
      sign: true
    });
    console.log(result_1);

    const result_2 = await eos.transfer('bob', 'alice', '1.0000 SYS', '', {
      authorization: 'bob@active',
      broadcast: true,
      sign: true
    })
    console.log(result_2);

    // retrieve balance
    const balance = await eos.getCurrencyBalance('eosio.token', 'bob', 'SYS');
    console.log('Currency Balance', balance);

    const gameContract = await eos.contract('game');
    await gameContract.insert('game', 'bob', 10, { authorization: 'game@active' });

    const records = await eos.getTableRows(true, 'game', 'game', 'record');
    console.log('======');
    console.log(records);

  } catch (error) {
    console.log(error);
  }
  
}

test();