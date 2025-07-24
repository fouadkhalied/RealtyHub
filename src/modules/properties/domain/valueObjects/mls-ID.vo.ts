export class MLSIDValueObject {
    private readonly _value: string;
    
    public readonly locationId: number;
    public readonly developerId: number;
    public readonly projectId: number;
    public readonly propertyTypeId: number;
  
    constructor(
      locationId: number,
      developerId: number,
      projectId: number,
      propertyTypeId: number,
    ) {
      this.locationId = locationId;
      this.developerId = developerId;
      this.projectId = projectId;
      this.propertyTypeId = propertyTypeId;
  
      this._value = [
        this.locationId,
        this.developerId,
        this.projectId,
        this.propertyTypeId
      ].join('-');
    }
  
    static create(
      locationId: number,
      developerId: number,
      projectId: number,
      propertyTypeId: number,
    ): string {
      const mlsid = new MLSIDValueObject(
        locationId,
        developerId,
        projectId,
        propertyTypeId,
      );
      return mlsid.value;
    }
  
    static fromDatabaseData(data: {
      locationId: number;
      developerId: number;
      projectId: number;
      propertyTypeId: number;
    }): MLSIDValueObject {
      return new MLSIDValueObject(
        data.locationId,
        data.developerId,
        data.projectId,
        data.propertyTypeId,
      );
    }
  
    static fromString(mlsidString: string): MLSIDValueObject {
      const parts = mlsidString.split('-');
      const [locationId, developerId, projectId, propertyTypeId, building, floor, unit] = parts;
      
      return new MLSIDValueObject(
        parseInt(locationId, 10),
        parseInt(developerId, 10),
        parseInt(projectId, 10),
        parseInt(propertyTypeId, 10)
      );
    }
  
    get value(): string {
      return this._value;
    }

    equals(other: MLSIDValueObject): boolean {
      return this._value === other._value;
    }
  
    toString(): string {
      return this._value;
    }
  
    toJSON(): string {
      return this._value;
    }
  }