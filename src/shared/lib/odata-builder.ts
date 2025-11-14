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
    if (field) this.params.set('$orderby', `${field} ${direction}`);
    return this;
  }

  skip(value: number): this {
    if (value > 0) this.params.set('$skip', value.toString());
    return this;
  }

  top(value: number): this {
    if (value > 0) this.params.set('$top', value.toString());
    return this;
  }

  count(include: boolean = true): this {
    if (include) this.params.set('$count', 'true');
    return this;
  }

  build(): string {
    return this.params.toString();
  }

  // ===============================
  // Static helpers (safe to call from anywhere)
  // ===============================
  static contains(field: string, value: string): string {
    if (!value || !String(value).trim()) return '';
    return `contains(tolower(${field}), tolower('${String(value).replace(/'/g, "''")}'))`;
  }

  static equals(field: string, value: string | number | boolean): string {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'string') {
      return `${field} eq '${value.replace(/'/g, "''")}'`;
    }
    return `${field} eq ${value}`;
  }

  static dateRange(field: string, startDate?: string, endDate?: string): string {
    const conditions: string[] = [];
    if (startDate) conditions.push(`${field} ge ${startDate}T00:00:00Z`);
    if (endDate) conditions.push(`${field} le ${endDate}T23:59:59Z`);
    return conditions.join(' and ');
  }

  // 🆕 NEW METHOD: Tạo OR conditions với equals - thay thế cho `in` operator
  static equalsOr(field: string, values: (string | number | boolean)[]): string {
    const validValues = (values || [])
      .filter(v => v !== null && v !== undefined && v !== '');
    
    if (validValues.length === 0) return '';
    
    const conditions = validValues.map(v => {
      if (typeof v === 'string') {
        return `(${field} eq '${v.replace(/'/g, "''")}')`;
      }
      return `(${field} eq ${v})`;
    });
    
    return conditions.join(' or ');
  }

  // 🆕 NEW METHOD: Tạo OR conditions với contains - cho partial search multiple values  
  static containsOr(field: string, values: string[]): string {
    const validValues = (values || [])
      .filter(v => v && String(v).trim());
    
    if (validValues.length === 0) return '';
    
    const conditions = validValues.map(v => 
      `contains(tolower(${field}), tolower('${String(v).replace(/'/g, "''")}'))`
    );
    
    return conditions.join(' or ');
  }

  // ⚠️ DEPRECATED: Giữ lại để backward compatibility, nhưng recommend dùng equalsOr
  static in(field: string, values: (string | number)[]): string {
    console.warn('⚠️ ODataQueryBuilder.in() may not be supported by your backend. Consider using equalsOr() instead.');
    const validValues = (values || []).map(v => v ?? '').filter(v => v !== '');
    if (validValues.length === 0) return '';
    const formatted = validValues.map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v);
    return `${field} in (${formatted.join(',')})`;
  }

  // ⚠️ DEPRECATED: Tương tự như trên
  static notIn(field: string, values: (string | number)[]): string {
    console.warn('⚠️ ODataQueryBuilder.notIn() may not be supported by your backend.');
    const validValues = (values || []).map(v => v ?? '').filter(v => v !== '');
    if (validValues.length === 0) return '';
    const formatted = validValues.map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v);
    return `${field} not in (${formatted.join(',')})`;
  }
}