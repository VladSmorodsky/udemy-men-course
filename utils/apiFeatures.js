class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryParamsObj = { ...this.queryString };
    const excludedQueryParams = ['sort', 'fields', 'page', 'limit'];
    excludedQueryParams.forEach(queryParam => delete queryParamsObj[queryParam]);

    let queryParamsString = JSON.stringify(queryParamsObj);
    queryParamsString = queryParamsString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryParamsString));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createDate');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const includedFields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(includedFields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 5;
    const skipTourCount = (page - 1) * limit;

    this.query = this.query.skip(skipTourCount).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;