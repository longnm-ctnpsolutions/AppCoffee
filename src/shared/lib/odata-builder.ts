export class ODataQueryBuilder {
  private params: URLSearchParams = new URLSearchParams();

  select(fields: string[]): this {
    if (fields.length > 0) {
      this.params.set('$select', fields.join(','));
    }
    return this;
  }

  filter(conditions: string[]): this {
    const validConditions = conditions.filter(Boolean);
    if (validConditions.length > 0) {
      this.params.set('$filter', validConditions.join(' and '));
    }
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.params.set('$orderby', `${field} ${direction}`);
    return this;
  }

  skip(value: number): this {
    if (value > 0) {
      this.params.set('$skip', value.toString());
    }
    return this;
  }

  top(value: number): this {
    this.params.set('$top', value.toString());
    return this;
  }

  count(include: boolean = true): this {
    if (include) {
      this.params.set('$count', 'true');
    }
    return this;
  }

  build(): string {
    return this.params.toString();
  }

   // Helper methods for common filter conditions
  static contains(field: string, value: string): string {
    if (!value.trim()) return '';
    return `contains(tolower(${field}), tolower('${value.replace(/'/g, "''")}'))`;
  }

  static equals(field: string, value: string | number | boolean): string {
    if (typeof value === 'string') {
      return `${field} eq '${value.replace(/'/g, "''")}'`;
    }
    return `${field} eq ${value}`;
  }

  static dateRange(field: string, startDate?: string, endDate?: string): string {
    const conditions: string[] = [];
    
    if (startDate) {
      conditions.push(`${field} ge ${startDate}T00:00:00Z`);
    }
    
    if (endDate) {
      conditions.push(`${field} le ${endDate}T23:59:59Z`);
    }
    
    return conditions.join(' and ');
  }
}