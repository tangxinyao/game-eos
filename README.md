# Game EOS-2048

## Client

```
npm run dev

npm run build
```

## Server

```
npm run dev

npm run build
```

## Contract

### Run the docker

```
docker run --name eosio \
  --publish 7777:7777 \
  --publish 127.0.0.1:5555:5555 \
  --volume /Users/xinyaotang/contracts:/Users/xinyaotang/contracts \
  --detach \
  eosio/eos \
  /bin/bash -c \
  "keosd --http-server-address=0.0.0.0:5555 & exec nodeos -e -p eosio --plugin eosio::producer_plugin --plugin eosio::history_plugin --plugin eosio::chain_api_plugin --plugin eosio::history_plugin --plugin eosio::history_api_plugin --plugin eosio::http_plugin -d /mnt/dev/data --config-dir /mnt/dev/config --http-server-address=0.0.0.0:7777 --access-control-allow-origin=* --contracts-console --http-validate-host=false --filter-on='*' --verbose-http-errors"
  ```

### (1) Create a wallet

```
cleos wallet create --to-console
```

>PW5JiUhzGohimWoSCpqMTqqV5WzFDZgT9jN8VoqRfWvFXwqTyy9x9

### (2) Create a pair of key

```
cleos create key --to-console

Private key: 5JYrjJ25Sx8vdkecyYU8XRsDJQEiV23KP8qBLniRFGphSCYq1VL

Public key: EOS7Sw8KP4v62erDt614UKju4D3pjXE1MqJcPw63M9MinjG9p3rt7
```

### (3) Import ours private key and private key of eosio

```
cleos wallet import
```

>5JYrjJ25Sx8vdkecyYU8XRsDJQEiV23KP8qBLniRFGphSCYq1VL

>5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3

### (4) Create Some account

```
cleos create account eosio bob EOS7Sw8KP4v62erDt614UKju4D3pjXE1MqJcPw63M9MinjG9p3rt7

cleos create account eosio alice EOS7Sw8KP4v62erDt614UKju4D3pjXE1MqJcPw63M9MinjG9p3rt7

cleos create account eosio game EOS7Sw8KP4v62erDt614UKju4D3pjXE1MqJcPw63M9MinjG9p3rt7 -p eosio@active

eosio-cpp -o game.wasm game.cpp --abigen

cleos set contract game /Users/xinyaotang/contracts/game

cleos push action game insert '["game", "alice", 10]' -p game@active
```

### (5) Token some money

```
cleos create account eosio eosio.token  EOS7Sw8KP4v62erDt614UKju4D3pjXE1MqJcPw63M9MinjG9p3rt7

cleos set contract eosio.token /Users/xinyaotang/contracts/eosio.contracts/eosio.token --abi abi/eosio.token.abi -p eosio.token@active

cleos push action eosio.token create '[ "eosio", "1000000000.0000 SYS"]' -p eosio.token@active

cleos push action eosio.token issue '[ "alice", "100.0000 SYS", "memo" ]' -p eosio@active

cleos push action eosio.token issue '[ "bob", "10000.0000 SYS", "memo" ]' -p eosio@active
```

### (6) Set the permission (unchecked)

```
cleos set account permission game active '{"threshold": 1,"keys": [{"key":"EOS898c2THJA52wF6behfTNUBkwbWfB1wnKhJUsv4CVQMmigHNoHb", "weight":1}],"accounts": [{"permission":{"actor":"game","permission":"eosio.code"},"weight":1}]}' owner -p game@owner
```