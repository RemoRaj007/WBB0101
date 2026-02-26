class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

      
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

      
        this.filterOptions = JSON.parse(queryStr);

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').map(field => {
                if (field.startsWith('-')) {
                    return [field.substring(1), 'DESC'];
                }
                return [field, 'ASC'];
            });
            this.sortOptions = sortBy;
        } else {
            this.sortOptions = [['createdAt', 'DESC']];
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',');
            this.attributes = fields;
        } else {
            this.attributes = { exclude: ['__v'] };
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const offset = (page - 1) * limit;

        this.paginationOptions = {
            limit,
            offset
        };

        return this;
    }

    
    getSequelizeOptions() {
        return {
            where: this.filterOptions || {},
            order: this.sortOptions || [['createdAt', 'DESC']],
            attributes: this.attributes || undefined,
            ...this.paginationOptions
        };
    }
}

module.exports = APIFeatures;
