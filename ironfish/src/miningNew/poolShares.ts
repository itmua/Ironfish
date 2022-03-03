/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { Database, open } from 'sqlite'
import sqlite3 from 'sqlite3'

/*
  - Payout can be really simple
    - Simplest: just payout full block amount (reward + fees) when confirmed
    - Slightly less simple: 20% of the wallet's _confirmed_ value whenever a block is confirmed
      - This disincentivizes burst-mining a little bit, while keeping some simplicity
      - Feels like a future improvement as needed
    - Payout proportionally to the amount of shares submitted since:
      - last found/confirmed block
      - last payout? This might be simpler actually or are these basically the same thing
  - Track found block confirmations (so we aren't paying out on forked blocks)
    - Minimal info needed to track this: hash, sequence, confirmations, is-paid-out
  - Shares associated with buckets
    - Simplest: start a new shares bucket whenever we find OR confirm a block (pick one)
      - Not ideal for miners since still relies on luck, but eh, simple.
    - Minimal info needed to track this: 
      - block-hash (or sequence, or whatever "bucket" identifier), payout-address, share-count, is-paid-out
  - The current shares array is not ideal
    - Useful for:
      - Verifying miners aren't submitted duplicate shares
        - For this, we only need to store shares submitted against the latest miningRequestId
      - Easy way to look at hashrate / share count
        - For this, we only need x hours, but having persisted data would also be pretty easy to work with
    - Not ideal for:
      - Payout
      - Persistence
*/

/*
  TL;DR:
  Persist using simple sqlite
  Simple payout on x hour interval
  Bucket by payout timestamp? Should be pretty simple
*/

export class MiningPoolShares {
  private readonly db: SharesDatabase
  private shares: Share[]

  constructor(db: SharesDatabase) {
    this.db = db
    this.shares = []
  }

  static async init(): Promise<MiningPoolShares> {
    const db = await SharesDatabase.init()
    return new MiningPoolShares(db)
  }

  async submitShare(
    graffiti: string,
    miningRequestId: number,
    randomness: number,
  ): Promise<void> {
    // TODO: Double check if hasShare is being called at the parent level or not
    // TODO: Just move the call here and noop if share exists
    // TODO: we can now automatically trim old shares from the array, it isn't used for
    //  anything critical past the current mining request id
    this.shares.push({
      timestamp: new Date(),
      graffiti,
      miningRequestId,
      randomness,
    })
    await this.db.newShare(graffiti)
  }

  hasShare(graffiti: string, miningRequestId: number, randomness: number): boolean {
    const found = this.shares.find(
      (el) =>
        el.miningRequestId === miningRequestId &&
        el.randomness === randomness &&
        el.graffiti === graffiti,
    )
    if (found != null) {
      return true
    }
    return false
  }

  totalShareCount(): number {
    return this.shares.length
  }

  graffitiShareCount(graffiti: string): number {
    return this.shares.filter((share) => share.graffiti === graffiti).length
  }

  totalShareCountSince(timeCutoff: Date): number {
    return this.shares.filter((share) => share.timestamp > timeCutoff).length
  }

  graffitiShareCountSince(graffiti: string, timeCutoff: Date): number {
    return this.shares.filter(
      (share) => share.timestamp > timeCutoff && share.graffiti === graffiti,
    ).length
  }
}

class SharesDatabase {
  private readonly db: Database

  constructor(db: Database) {
    this.db = db
  }

  static async init(): Promise<SharesDatabase> {
    // TODO: $DATADIR/pool/database.sqlite
    const db = await open({
      filename: './foo.db',
      driver: sqlite3.Database,
    })
    // TODO: Copy these into build folder or find a better solution
    await db.migrate({ migrationsPath: '../ironfish/src/miningNew/migrations' })
    return new SharesDatabase(db)
  }

  async newShare(payoutAddress: string) {
    await this.db.run('INSERT INTO share (payout_address) VALUES ?', payoutAddress)
  }
}

type Share = {
  timestamp: Date
  graffiti: string
  miningRequestId: number
  randomness: number
}
