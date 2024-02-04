class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    //BUILD QUERY
    //1A) filtering
    const queryObj = { ...this.queryString };
    const excludedArrays = ['page', 'sort', 'limit', 'fields'];
    excludedArrays.forEach(el => delete queryObj[el]);
    //1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, el => {
      return `$${el}`;
    });
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    //2)Sorting
    if (this.queryString.sort) {
      const sort = this.queryString.sort.split(',').join(' ');
      this.query.sort(sort);
    } else {
      this.query.sort('-createdAt name');
    }
    return this;
  }
  limitFields() {
    //3) Limiting the output fields
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    //4) Pagination  using page and limits
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    // if (this.queryString.page) {
    //   const numOfDocuments = await Tour.countDocuments();
    //   if (skip >= numOfDocuments)
    //     throw new Error('404. This page does not exist.');
    // }
    return this;
  }
}
module.exports = APIFeatures;
