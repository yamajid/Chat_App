# Generated by Django 5.1.7 on 2025-05-01 13:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat_backend', '0010_alter_chatroom_room_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chatroom',
            name='room_type',
            field=models.CharField(choices=[('private', 'Private Chat'), ('general', 'General Chat')], default='public', max_length=10),
        ),
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('invite', 'Invitation'), ('message', 'Message')], max_length=10),
        ),
    ]
