import EOS from "eosjs";

export interface IRecord {
  id: number;
  user: string;
  score: number;
  updated_at: string;
}

export class GameContractService {
  private eos: any;

  public constructor() {
    this.eos = EOS({
      httpEndpoint: "http://127.0.0.1:7777",
      keyProvider: "5JYrjJ25Sx8vdkecyYU8XRsDJQEiV23KP8qBLniRFGphSCYq1VL",
    });
  }

  public async pay(user: string, amount: number) {
    const config = {
      authorization: user + "@active",
      broadcast: true,
      sign: true,
    };
    await this.eos.transfer(user, "game", this.formatAmount(amount), "", config);
  }

  public async reward(user: string, amount: number) {
    const config = {
      authorization: "game@active",
      broadcast: true,
      sign: true,
    };
    await this.eos.transfer("game", user, this.formatAmount(amount), "", config);
  }

  public async getBalance(user: string): Promise<number> {
    const balances = await this.eos.getCurrencyBalance("eosio.token", user, "SYS");
    const sys = balances.find((balance: any) => balance.indexOf("SYS"));
    if (!sys) {
      return 0;
    }
    return Number(sys.split(" ")[0]);
  }

  public async getRecords(): Promise<IRecord[]> {
    const records = await this.eos.getTableRows(true, "game", "game", "record");
    return records.rows;
  }

  public async insertRecord(user: string, score: number) {
    const gameContract = await this.eos.contract("game");
    await gameContract.insert("game", user, score, { authorization: "game@active" });
  }

  private formatAmount(amount: number): string {
    const temp = String(amount).split(".");
    const head = temp[0];
    const tail = temp[1];
    return (head || "0") + "." + (tail ? (tail + "0000").substr(0, 4) : "0000") + " SYS";
  }
}
