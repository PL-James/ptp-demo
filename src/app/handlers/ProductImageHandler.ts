import { Condition } from '@decaf-ts/core';
import { ProductImage } from '@pharmaledgerassoc/ptp-toolkit/shared';
import {
  NgxEventHandler,
  FileUploadComponent,
  getModelAndRepository,
} from '@decaf-ts/for-angular';

export class ProductImageHandler extends NgxEventHandler {
  override async render(instance: FileUploadComponent): Promise<void> {
    const repo = getModelAndRepository('ProductImage');
    if (repo && instance.value) {
      const { repository } = repo;
      const data = (await repository
        .select()
        .where(
          Condition.attr('productCode' as keyof ProductImage).eq(instance.value)
        )
        .execute()) as ProductImage[];
      if (data?.length) {
        instance.setValue(data[0].content);
        // instance.value = JSON.parse(data[0].content[0]) as string;
      }
    }
  }
}
