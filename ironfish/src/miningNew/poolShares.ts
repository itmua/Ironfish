/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

export class MiningPoolShares {
  private shares: Share[]

  constructor() {
    this.shares = []
  }

  submitShare(graffiti: string, miningRequestId: number, randomness: number): void {
    this.shares.push({
      timestamp: new Date(),
      graffiti,
      miningRequestId,
      randomness,
    })
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

type Share = {
  timestamp: Date
  graffiti: string
  miningRequestId: number
  randomness: number
}
