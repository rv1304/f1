/**
 * VelocityForge Vector3 Utility
 * 
 * Lightweight 3D vector implementation optimized for real-time physics calculations.
 */

export class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Set vector components
   */
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Copy another vector
   */
  copy(vector) {
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
    return this;
  }

  /**
   * Clone this vector
   */
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  /**
   * Add another vector
   */
  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
    return this;
  }

  /**
   * Subtract another vector
   */
  subtract(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
    return this;
  }

  /**
   * Multiply by scalar
   */
  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  /**
   * Divide by scalar
   */
  divideScalar(scalar) {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
      this.z /= scalar;
    }
    return this;
  }

  /**
   * Dot product with another vector
   */
  dot(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }

  /**
   * Cross product with another vector
   */
  cross(vector) {
    const x = this.y * vector.z - this.z * vector.y;
    const y = this.z * vector.x - this.x * vector.z;
    const z = this.x * vector.y - this.y * vector.x;
    
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Calculate vector length
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Calculate squared length (faster than length())
   */
  lengthSquared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Normalize vector to unit length
   */
  normalize() {
    const length = this.length();
    if (length > 0) {
      this.divideScalar(length);
    }
    return this;
  }

  /**
   * Calculate distance to another vector
   */
  distanceTo(vector) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    const dz = this.z - vector.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate squared distance to another vector (faster)
   */
  distanceToSquared(vector) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    const dz = this.z - vector.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Linear interpolation with another vector
   */
  lerp(vector, alpha) {
    this.x += (vector.x - this.x) * alpha;
    this.y += (vector.y - this.y) * alpha;
    this.z += (vector.z - this.z) * alpha;
    return this;
  }

  /**
   * Check if vector equals another vector
   */
  equals(vector) {
    return this.x === vector.x && this.y === vector.y && this.z === vector.z;
  }

  /**
   * Check if vector is approximately equal to another vector
   */
  approximatelyEquals(vector, epsilon = 0.0001) {
    return Math.abs(this.x - vector.x) < epsilon &&
           Math.abs(this.y - vector.y) < epsilon &&
           Math.abs(this.z - vector.z) < epsilon;
  }

  /**
   * Convert to array
   */
  toArray() {
    return [this.x, this.y, this.z];
  }

  /**
   * Convert to object
   */
  toObject() {
    return { x: this.x, y: this.y, z: this.z };
  }

  /**
   * Convert to string
   */
  toString() {
    return `Vector3(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)})`;
  }

  /**
   * Static methods for common operations
   */
  static add(a, b) {
    return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  static subtract(a, b) {
    return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  static multiplyScalar(vector, scalar) {
    return new Vector3(vector.x * scalar, vector.y * scalar, vector.z * scalar);
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static cross(a, b) {
    return new Vector3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  static distance(a, b) {
    return a.distanceTo(b);
  }

  static lerp(a, b, alpha) {
    return new Vector3(
      a.x + (b.x - a.x) * alpha,
      a.y + (b.y - a.y) * alpha,
      a.z + (b.z - a.z) * alpha
    );
  }

  // Common vector constants
  static get ZERO() {
    return new Vector3(0, 0, 0);
  }

  static get ONE() {
    return new Vector3(1, 1, 1);
  }

  static get UP() {
    return new Vector3(0, 1, 0);
  }

  static get DOWN() {
    return new Vector3(0, -1, 0);
  }

  static get LEFT() {
    return new Vector3(-1, 0, 0);
  }

  static get RIGHT() {
    return new Vector3(1, 0, 0);
  }

  static get FORWARD() {
    return new Vector3(0, 0, 1);
  }

  static get BACK() {
    return new Vector3(0, 0, -1);
  }
}
