import { Traits } from "./traits";

export class User {
  private traits: Traits;

  constructor() {

  }

  identify(id?: string, traits: Traits = {}) {
    newTraits = {
      ...this.getTraits(),
      ...traits,
    };

    this.setTraits(newTraits);
  }

  private getTraits(){
    return this.traits;
  }

  private setTraits(){}
}
