// DTO tạo product

import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là text' })
  @MinLength(2, { message: 'Tên phải từ 2 ký tự' })
  @MaxLength(200, { message: 'Tên không quá 200 ký tự' })
  name: string;

  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá không được âm' })
  price: number;

  @IsNumber({}, { message: 'categoryId phải là số' })
  categoryId: number;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là text' })
  @MaxLength(1000, { message: 'Mô tả không quá 1000 ký tự' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'imageUrl phải là text' })
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'imageId phải là text' })
  imageId?: string;

  @IsOptional()
  @IsString({ message: 'modelUrl phải là text' })
  modelUrl?: string;

  @IsOptional()
  @IsString({ message: 'dimensions phải là text' })
  dimensions?: string;

  @IsOptional()
  @IsNumber({}, { message: 'weight phải là số' })
  @Min(0, { message: 'Cân nặng không được âm' })
  weight?: number;

  @IsNumber({}, { message: 'stock phải là số' })
  @Min(0, { message: 'Tồn kho không được âm' })
  stock: number;
}
