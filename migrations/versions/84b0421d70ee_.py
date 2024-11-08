"""empty message

Revision ID: 84b0421d70ee
Revises: 628f31610c4b
Create Date: 2024-11-05 17:54:08.610582

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '84b0421d70ee'
down_revision = '628f31610c4b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('order', schema=None) as batch_op:
        batch_op.alter_column('billing_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('shipping_id',
               existing_type=sa.INTEGER(),
               nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('order', schema=None) as batch_op:
        batch_op.alter_column('shipping_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('billing_id',
               existing_type=sa.INTEGER(),
               nullable=True)

    # ### end Alembic commands ###
