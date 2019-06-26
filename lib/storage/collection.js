module.exports = class Collection {
  constructor(iterable) {
    this.iterable = iterable;
  }

  async *[Symbol.asyncIterator]() {
    for await (const value of this.iterable) {
      yield value;
    }
  }
}