#include <string>
#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>
#include <eosiolib/contract.hpp>
#include <eosiolib/types.h>

using namespace eosio;

class game : public eosio::contract {
  private:
    struct [[eosio::table]] record_t {
      uint64_t id;
      account_name user;
      uint64_t score;
      uint64_t updated_at;

      uint64_t primary_key() const {
        return id;
      }
    };

  public:
    using contract::contract;

    game(account_name self): contract(self){}

    [[eosio::action]]
    void insert(account_name supervisor, account_name participant, uint64_t score) {
      require_auth(supervisor);

      typedef eosio::multi_index<N(record), record_t> record_index;
      record_index records(_self, _self);

      // summery
      records.emplace(supervisor, [&](auto &row) {
        row.id = records.available_primary_key();
        row.user = participant;
        row.score = score;
        row.updated_at = current_time();
      });
    }
};

EOSIO_ABI( game, (insert) )
